import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString, IsNotEmpty } from 'class-validator';
import { FirebaseAuthError } from './errors/firebase-auth.error';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';

export class GenerateTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  idToken: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  refreshToken: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @ApiOperation({ summary: 'Generate access and refresh tokens from Firebase ID token' })
  @ApiBody({ type: GenerateTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        accessTokenExpiresIn: { type: 'number', description: 'Access token expiration time in seconds' },
        refreshTokenExpiresIn: { type: 'number', description: 'Refresh token expiration time in seconds' },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token validation failed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        code: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  })
  async generateToken(@Body() body: GenerateTokenDto) {
    this.logger.log('Attempting to generate tokens for request');

    try {
      const tokens = await this.authService.validateFirebaseToken(
        body.idToken,
      );

      this.logger.log('Tokens generated successfully');

      return {
        success: true,
        ...tokens,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Token generation failed', {
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        timestamp: new Date().toISOString(),
      });

      const errorResponse = {
        success: false,
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      };

      // Handle TokenValidationError
      if (error.name === 'TokenValidationError') {
        if (error.code === 'TOKEN_EXPIRED') {
          throw new BadRequestException({
            ...errorResponse,
            message: 'Your Firebase ID token has expired. Please log in again to continue.',
            details: 'Firebase ID token has expired. Please obtain a new token by re-authenticating.',
          });
        }
      }

      // Handle FirebaseAuthError
      if (error instanceof FirebaseAuthError || error.name === 'FirebaseAuthError') {
        switch (error.code) {
          case 'auth/id-token-expired':
            throw new BadRequestException({
              ...errorResponse,
              message: 'Your Firebase ID token has expired. Please log in again to continue.',
              details: 'Firebase ID token has expired. Please obtain a new token by re-authenticating.',
            });
          case 'auth/invalid-id-token':
            throw new BadRequestException({
              ...errorResponse,
              message: 'Invalid authentication token. Please try logging in again.',
            });
          case 'auth/user-disabled':
            throw new BadRequestException({
              ...errorResponse,
              message: 'Your account has been disabled. Please contact support.',
              status: HttpStatus.FORBIDDEN,
            });
          case 'auth/user-not-found':
            throw new BadRequestException({
              ...errorResponse,
              message: 'User account not found. Please register first.',
              status: HttpStatus.NOT_FOUND,
            });
          default:
            throw new BadRequestException({
              ...errorResponse,
              message: 'Authentication failed. Please try logging in again.',
            });
        }
      }

      // Handle any other unexpected errors
      throw new InternalServerErrorException({
        success: false,
        message: 'An unexpected error occurred during authentication. Please try again.',
        code: error.code || 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Generate new access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'New access token generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid refresh token',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  })
  async refreshToken(@Body() body: RefreshTokenDto) {
    try {
      const tokens = await this.authService.refreshAccessToken(body.refreshToken);

      return {
        success: true,
        ...tokens,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
