import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString, IsNotEmpty } from 'class-validator';
import { FirebaseAuthError } from './errors/firebase-auth.error';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { v4 as uuid } from 'uuid';

export class GenerateTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  idToken: string;
}

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @ApiOperation({ summary: 'Generate authentication tokens' })
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
        requestId: { type: 'string' },
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
        requestId: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        timestamp: { type: 'string' },
        requestId: { type: 'string' },
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
        requestId: uuid(),
      };
    } catch (error) {
      this.logger.error('Token generation failed', {
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        timestamp: new Date().toISOString(),
        requestId: uuid(),
      });

      const errorResponse = {
        success: false,
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
        requestId: uuid(),
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
        requestId: uuid(),
      });
    }
  }
}
