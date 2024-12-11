import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  Param,
  UploadedFile,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
  ApiConsumes,
} from '@nestjs/swagger';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UserProfileResponse } from './interfaces/user-profile.interface';
import { NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Transform } from 'class-transformer';
import { SaveProfileDto } from './dto/save-profile.dto';
import { UpdateSavedProfileDto } from './dto/update-saved-profile.dto';
import { SaveProfileResponseDto } from './dto/save-profile-response.dto';

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string when provided' })
  @Transform(({ value }) => (value === undefined || value === null ? undefined : value.toString()))
  name?: string;

  @ApiProperty({
    description: 'Date of birth in ISO format',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid ISO date string when provided' })
  @Transform(({ value }) => (value === undefined || value === null ? undefined : value.toString()))
  date_of_birth?: string;

  @ApiProperty({
    description: 'Type of business',
    example: 'Retail',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Business type must be a string when provided' })
  @Transform(({ value }) => (value === undefined || value === null ? undefined : value.toString()))
  businessType?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Profile image file',
  })
  @IsOptional()
  profileImage?: Express.Multer.File;
}

@ApiTags('users')
@Controller('user')
@UseGuards(FirebaseAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('complete-profile')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complete user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileResponseDto,
  })
  async getCompleteUserProfile(@Request() req): Promise<UserProfileResponse> {
    return this.userService.getCompleteUserProfile(req.user);
  }

  @Post('updateprofile')
  @ApiBearerAuth('Firebase-auth')
  @ApiOperation({
    summary: 'Update user profile with optional image upload',
    description:
      'Updates user profile information including name, date of birth, and business type',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateProfile(
    @Request() req,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserProfileResponse> {
    // Make all fields optional and handle empty values
    const cleanedData = {
      ...(updateUserProfileDto.name && { name: updateUserProfileDto.name }),
      ...(updateUserProfileDto.date_of_birth && { date_of_birth: updateUserProfileDto.date_of_birth }),
      ...(updateUserProfileDto.businessType && { businessType: updateUserProfileDto.businessType }),
    };

    return this.userService.updateUserProfile(
      req.user,
      cleanedData,
      file,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved-profiles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved profiles for current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of saved profiles'
  })
  @ApiResponse({
    status: 401,
    description: 'User not found in database'
  })
  async getSavedProfiles(@Request() req) {
    // req.user is already verified by JwtAuthGuard and contains Firebase user data
    return this.userService.getSavedProfiles(req.user.phoneNumber);
  }

  @Post('save-profile')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save another user\'s profile' })
  @ApiResponse({
    status: 201,
    description: 'Profile saved successfully',
    type: SaveProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Profile already saved or trying to save own profile',
  })
  @ApiResponse({
    status: 404,
    description: 'User to save not found',
  })
  async saveProfile(
    @Request() req,
    @Body() saveProfileDto: SaveProfileDto,
  ): Promise<SaveProfileResponseDto> {
    return this.userService.saveProfile(req.user, saveProfileDto.userIdToSave);
  }

  @Put('saved-profile/update')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update transaction count for a saved profile' })
  @ApiResponse({
    status: 200,
    description: 'Saved profile updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot update inactive saved profile',
  })
  @ApiResponse({
    status: 404,
    description: 'Saved profile not found',
  })
  async updateSavedProfile(
    @Request() req,
    @Body() updateSavedProfileDto: UpdateSavedProfileDto,
  ) {
    return this.userService.updateSavedProfile(
      req.user,
      updateSavedProfileDto.savedUserId,
      updateSavedProfileDto.transactionCount,
    );
  }
}
