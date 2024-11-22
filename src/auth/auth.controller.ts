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
  @ApiProperty({
    description: 'Firebase ID token to be validated',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsString({ message: 'idToken must be a string' })
  @IsNotEmpty({ message: 'idToken is required' })
  readonly idToken: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('generate-token')
  @ApiOperation({
    summary: 'Generate JWT token',
    description: 'Validates Firebase token and generates a custom JWT token',
  })
  @ApiBody({ type: GenerateTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...' },
        timestamp: { type: 'string', example: '2024-03-14T12:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or validation failed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'auth/invalid-token' },
            message: { type: 'string', example: 'Token validation failed' },
          },
        },
        timestamp: { type: 'string', example: '2024-03-14T12:00:00.000Z' },
      },
    },
  })
  async generateToken(@Body() body: GenerateTokenDto) {
    this.logger.log('Attempting to generate token for request');

    try {
      const customToken = await this.authService.validateFirebaseToken(
        body.idToken,
      );

      this.logger.log('Token generated successfully');

      return {
        success: true,
        token: customToken,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Token generation failed', {
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        timestamp: new Date().toISOString(),
      });

      if (error instanceof FirebaseAuthError) {
        const errorResponse = {
          success: false,
          message: error.message,
          code: error.code,
          timestamp: new Date().toISOString(),
        };

        switch (error.code) {
          case 'auth/id-token-expired':
          case 'auth/invalid-id-token':
            throw new BadRequestException(errorResponse);
          case 'auth/user-disabled':
            throw new BadRequestException({
              ...errorResponse,
              status: HttpStatus.FORBIDDEN,
            });
          case 'auth/user-not-found':
            throw new BadRequestException({
              ...errorResponse,
              status: HttpStatus.NOT_FOUND,
            });
        }
      }

      throw new InternalServerErrorException({
        success: false,
        message: 'An unexpected error occurred during authentication',
        timestamp: new Date().toISOString(),
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
