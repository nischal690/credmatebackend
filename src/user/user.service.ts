import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { FirebaseService } from '../auth/firebase.service';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsString()
  @IsOptional()
  businessType?: string;
}

// First, create a type for the response
type UserProfileResponse = {
  name: string;
  date_of_birth?: Date | null;
  businessType: string;
};

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly authService: AuthService,
  ) {}

  async updateUserProfile(
    token: string,
    userData: UpdateUserProfileDto,
  ): Promise<UserProfileResponse> {
    try {
      const decodedToken = await this.authService.verifyCustomToken(token);

      if (!decodedToken || !decodedToken.uniqueId) {
        throw new UnauthorizedException('Invalid token or missing uniqueId');
      }

      // Only include fields that were provided in the update
      const updateData: any = {};

      if (userData.name !== undefined) {
        updateData.name = userData.name;
      }

      if (userData.date_of_birth !== undefined) {
        updateData.date_of_birth = new Date(userData.date_of_birth);
      }

      if (userData.businessType !== undefined) {
        updateData.businessType = userData.businessType;
      }

      // If no fields to update, throw error
      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields provided for update');
      }

      // Ensure required fields are always selected
      const selectFields = {
        name: true,
        date_of_birth: true,
        businessType: true,
      };

      const updatedUser = await this.prismaService.user.update({
        where: {
          uniqueId: decodedToken.uniqueId,
        },
        data: updateData,
        select: selectFields,
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new Error('User not found');
      }
      throw new Error('Failed to update user profile');
    }
  }
}
