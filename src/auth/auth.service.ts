import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '../../database/prisma/prisma.service';

// Define interfaces for better type safety
interface DecodedFirebaseToken {
  uid: string;
  email?: string;
  phone_number?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  auth_time: number;
  iat: number;
  exp: number;
}

export interface CustomJwtPayload {
  uid: string;
  phoneNumber: string;
  uniqueId: string;
  email?: string;
  name?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

interface ExtendedJwtPayload extends jwt.JwtPayload, CustomJwtPayload {}

export class TokenValidationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'TokenValidationError';
  }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.jwtSecret = this.getRequiredConfig('JWT_SECRET');
    this.jwtExpiresIn = this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN') || '30m';
    this.refreshTokenSecret = this.getRequiredConfig('JWT_REFRESH_SECRET');
    this.refreshTokenExpiresIn = this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d';
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Required configuration ${key} is missing`);
    }
    return value;
  }

  public generateUniqueId(phoneNumber: string): string {
    // Remove any non-numeric characters from the phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Create a deterministic hash based on the phone number
    const hash = createHash('sha256')
      .update(cleanPhone)
      .digest('hex')
      .substring(0, 16); // Take first 16 characters for a shorter ID

    // Prefix with 'u' to indicate it's a user ID and add first 4 digits of phone
    return `u${cleanPhone.slice(-4)}${hash}`;
  }

  private generateTokens(payload: CustomJwtPayload): TokenResponse {
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      algorithm: 'HS256',
      audience: this.configService.get('JWT_AUDIENCE') || undefined,
      issuer: this.configService.get('JWT_ISSUER') || undefined,
    });

    const refreshToken = jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn,
      algorithm: 'HS256',
    });

    // Convert both expiration times to seconds
    const accessTokenExpiresIn = this.parseTimeToSeconds(this.jwtExpiresIn);
    const refreshTokenExpiresIn = this.parseTimeToSeconds(this.refreshTokenExpiresIn);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    };
  }

  private parseTimeToSeconds(time: string): number {
    const unit = time.slice(-1);
    const value = parseInt(time.slice(0, -1));
    
    switch(unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 30 * 60; // default to 30 minutes if invalid format
    }
  }

  async validateFirebaseToken(idToken: string): Promise<TokenResponse> {
    try {
      this.logger.debug('Validating Firebase token...');

      const decodedToken = (await this.firebaseService.verifyIdToken(
        idToken,
      )) as DecodedFirebaseToken;

      if (!decodedToken.uid) {
        throw new TokenValidationError(
          'INVALID_TOKEN_PAYLOAD',
          'Firebase token missing required uid field',
        );
      }

      if (!decodedToken.phone_number) {
        throw new TokenValidationError(
          'INVALID_TOKEN_PAYLOAD',
          'Firebase token missing required phone number',
        );
      }

      // Generate unique ID from phone number
      const uniqueId = this.generateUniqueId(decodedToken.phone_number);

      // Create or update user in database
      await this.prismaService.user.upsert({
        where: { phoneNumber: decodedToken.phone_number },
        update: {
          uniqueId: uniqueId,
          email: decodedToken.email,
          name: decodedToken.name,
        },
        create: {
          phoneNumber: decodedToken.phone_number,
          uniqueId: uniqueId,
          email: decodedToken.email,
          name: decodedToken.name,
        },
      });

      // Generate JWT tokens
      const jwtPayload: CustomJwtPayload = {
        uid: decodedToken.uid,
        phoneNumber: decodedToken.phone_number,
        uniqueId: uniqueId,
        email: decodedToken.email,
        name: decodedToken.name,
      };

      return this.generateTokens(jwtPayload);
    } catch (error) {
      this.logger.error('Token validation failed', {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      });

      if (error instanceof TokenValidationError) {
        throw error;
      }

      if (error.code === 'auth/id-token-expired') {
        throw new TokenValidationError(
          'TOKEN_EXPIRED',
          'Firebase token has expired',
        );
      }

      if (error.code === 'auth/id-token-revoked') {
        throw new TokenValidationError(
          'TOKEN_REVOKED',
          'Firebase token has been revoked',
        );
      }

      throw new TokenValidationError(
        'VALIDATION_ERROR',
        'Failed to validate Firebase token',
        error,
      );
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret, {
        algorithms: ['HS256'],
      }) as CustomJwtPayload;

      // Generate new tokens
      return this.generateTokens(decoded);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenValidationError(
          'REFRESH_TOKEN_EXPIRED',
          'Refresh token has expired',
        );
      }
      throw new TokenValidationError(
        'INVALID_REFRESH_TOKEN',
        'Invalid refresh token',
      );
    }
  }

  async verifyCustomToken(token: string): Promise<CustomJwtPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
        audience: this.configService.get('JWT_AUDIENCE') || undefined,
        issuer: this.configService.get('JWT_ISSUER') || undefined,
      }) as CustomJwtPayload;

      if (!decoded.uniqueId) {
        throw new TokenValidationError(
          'INVALID_TOKEN_PAYLOAD',
          'Token missing required uniqueId field',
        );
      }

      return decoded;
    } catch (error) {
      if (error instanceof TokenValidationError) {
        throw error;
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenValidationError(
          'TOKEN_EXPIRED',
          'JWT token has expired',
        );
      }
      throw new TokenValidationError(
        'VALIDATION_ERROR',
        'Failed to validate JWT token',
      );
    }
  }
}
