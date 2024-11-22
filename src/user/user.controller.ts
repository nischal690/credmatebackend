import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Date of birth in ISO format',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({
    description: 'Type of business',
    example: 'Retail',
  })
  @IsString()
  businessType: string;
}

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates user profile information including name, date of birth, and business type',
  })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            updated_fields: {
              type: 'object',
              example: {
                name: 'John Doe',
                date_of_birth: '1990-01-01',
                businessType: 'Retail',
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-03-14T12:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or validation failed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Invalid profile data' },
        timestamp: { type: 'string', example: '2024-03-14T12:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updateProfile(
    @Request() req,
    @Body() profileData: UpdateUserProfileDto,
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const updatedFields = await this.userService.updateUserProfile(
        token,
        profileData,
      );

      return {
        success: true,
        data: {
          updated_fields: updatedFields,
        },
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
