import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma/prisma.service';
import { TokenValidationError } from './errors/token-validation.error';
import { PrismaClient } from '@prisma/client';

interface DecodedFirebaseToken {
  uid: string;
  email?: string;
  phone_number?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async validateFirebaseToken(idToken: string) {
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

      // Create or update user in database
      const existingUser = await this.prismaService.user.findUnique({
        where: { phoneNumber: decodedToken.phone_number },
      });

      if (existingUser) {
        await this.prismaService.user.update({
          where: { phoneNumber: decodedToken.phone_number },
          data: {
            email: decodedToken.email,
            name: decodedToken.name,
          },
        });
      } else {
        await this.prismaService.user.create({
          data: {
            phoneNumber: decodedToken.phone_number,
            email: decodedToken.email,
            name: decodedToken.name,
          },
        });
      }

      return {
        uid: decodedToken.uid,
        phoneNumber: decodedToken.phone_number,
        email: decodedToken.email,
        name: decodedToken.name,
        emailVerified: decodedToken.email_verified,
      };
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
}
