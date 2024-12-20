import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { FirebaseService } from '../auth/firebase.service';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../common/base/base.service';
import { ValidationUtils } from '../common/utils/validation.utils';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { UserProfileResponse } from './interfaces/user-profile.interface';
import { S3Service } from '../common/services/s3.service';

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

@Injectable()
export class UserService extends BaseService {
  constructor(
    protected readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly authService: AuthService,
    private readonly s3Service: S3Service,
  ) {
    super(prismaService);
  }

  async updateUserProfile(
    user: any,
    updateData: Partial<UpdateUserProfileDto>,
    file?: Express.Multer.File,
  ): Promise<UserProfileResponse> {
    // Get user from database
    const dbUser = await this.prismaService.user.findUnique({
      where: { phoneNumber: user.phoneNumber },
      select: { id: true },
    });

    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }

    let profileImageUrl: string | undefined;

    // If a file was uploaded, process it
    if (file) {
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image files are allowed');
      }

      // Upload to S3 in user's dedicated folder
      try {
        profileImageUrl = await this.s3Service.uploadFile(
          file,
          dbUser.id
        );
      } catch (error) {
        throw new BadRequestException(`Failed to upload image: ${error.message}`);
      }
    }

    // Only include fields that were actually provided
    const dataToUpdate = {
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.date_of_birth && { date_of_birth: updateData.date_of_birth }),
      ...(updateData.businessType && { businessType: updateData.businessType }),
      ...(profileImageUrl && { profileImageUrl }),
    };

    // Update user profile in database only if we have data to update
    if (Object.keys(dataToUpdate).length === 0 && !file) {
      throw new BadRequestException('No data provided for update');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: dbUser.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        date_of_birth: true,
        businessType: true,
        profileImageUrl: true,
        phoneNumber: true,
        email: true,
        aadhaarNumber: true,
        panNumber: true,
        plan: true,
        referralCode: true,
        planPrice: true,
        metadata: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
    });

    return updatedUser;
  }

  async getUserFiles(user: any): Promise<string[]> {
    const dbUser = await this.prismaService.user.findUnique({
      where: { phoneNumber: user.phoneNumber },
      select: { id: true },
    });

    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }

    return this.s3Service.listUserFiles(dbUser.id);
  }

  async getCompleteUserProfile(user: any): Promise<UserProfileResponse> {
    let userProfile = await this.prismaService.user.findUnique({
      where: { phoneNumber: user.phoneNumber },
      select: {
        id: true,
        email: true,
        name: true,
        date_of_birth: true,
        businessType: true,
        profileImageUrl: true,
        phoneNumber: true,
        aadhaarNumber: true,
        panNumber: true,
        plan: true,
        referralCode: true,
        planPrice: true,
        metadata: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
    });

    if (!userProfile) {
      // Create new user if they don't exist
      userProfile = await this.prismaService.user.create({
        data: {
          phoneNumber: user.phoneNumber,
          name: user.name || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          date_of_birth: true,
          businessType: true,
          profileImageUrl: true,
          phoneNumber: true,
          aadhaarNumber: true,
          panNumber: true,
          plan: true,
          referralCode: true,
          planPrice: true,
          metadata: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
      });
    }

    return userProfile;
  }

  async saveProfile(currentUser: any, userIdToSave: string): Promise<any> {
    // Get current user from database using phone number from Firebase auth
    const dbCurrentUser = await this.prismaService.user.findUnique({
      where: { phoneNumber: currentUser.phoneNumber },
    });

    if (!dbCurrentUser) {
      throw new UnauthorizedException('Current user not found in database');
    }

    // Check if user to save exists
    const userToSave = await this.prismaService.user.findUnique({
      where: { id: userIdToSave },
    });

    if (!userToSave) {
      throw new NotFoundException('User to save not found');
    }

    // Prevent saving own profile
    if (dbCurrentUser.id === userIdToSave) {
      throw new BadRequestException('Cannot save your own profile');
    }

    // Check if already saved
    const existingSave = await this.prismaService.savedProfile.findUnique({
      where: {
        savedByUserId_savedUserId: {
          savedByUserId: dbCurrentUser.id,
          savedUserId: userIdToSave,
        },
      },
    });

    let savedProfile;

    if (existingSave) {
      if (existingSave.isActive) {
        throw new BadRequestException('Profile already saved');
      } else {
        // Reactivate if previously removed
        savedProfile = await this.prismaService.savedProfile.update({
          where: { id: existingSave.id },
          data: { 
            isActive: true,
            name: userToSave.name,
            mobileNumber: userToSave.phoneNumber,
          },
        });
      }
    } else {
      // Create new saved profile
      savedProfile = await this.prismaService.savedProfile.create({
        data: {
          savedByUserId: dbCurrentUser.id,
          savedUserId: userIdToSave,
          isActive: true,
          transactionCount: 0,  // Initialize with 0
          name: userToSave.name,
          mobileNumber: userToSave.phoneNumber,
        },
      });
    }

    return {
      ...savedProfile,
      success: true,
    };
  }

  async updateSavedProfile(
    currentUser: any,
    savedUserId: string,
    transactionCount: number,
  ): Promise<any> {
    // Find the saved profile entry
    const savedProfile = await this.prismaService.savedProfile.findUnique({
      where: {
        savedByUserId_savedUserId: {
          savedByUserId: currentUser.id,
          savedUserId: savedUserId,
        },
      },
    });

    if (!savedProfile) {
      throw new NotFoundException('Saved profile not found');
    }

    if (!savedProfile.isActive) {
      throw new BadRequestException('Cannot update inactive saved profile');
    }

    // Update the transaction count
    return this.prismaService.savedProfile.update({
      where: {
        id: savedProfile.id,
      },
      data: {
        transactionCount,
      },
    });
  }

  async getSavedProfiles(phoneNumber: string) {
    // Get user from database using phone number
    const dbCurrentUser = await this.prismaService.user.findUnique({
      where: { phoneNumber }
    });

    if (!dbCurrentUser) {
      throw new UnauthorizedException('Current user not found in database');
    }

    // Get all saved profiles for this user
    const savedProfiles = await this.prismaService.savedProfile.findMany({
      where: {
        savedByUserId: dbCurrentUser.id,
        isActive: true,
      },
    });

    // Get all the saved user IDs
    const savedUserIds = savedProfiles.map(profile => profile.savedUserId);

    // Fetch user details for all saved users in a single query
    const savedUsers = await this.prismaService.user.findMany({
      where: {
        id: {
          in: savedUserIds,
        },
      },
      select: {
        id: true,
        name: true,
        date_of_birth: true,
        businessType: true,
        profileImageUrl: true,
        phoneNumber: true,
        aadhaarNumber: true,
        panNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create a map of user details for quick lookup
    const userDetailsMap = savedUsers.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    // Format the response to match the expected structure
    return {
      savedProfiles: savedProfiles.map(profile => ({
        ...userDetailsMap[profile.savedUserId],
        transactionCount: profile.transactionCount,
        savedAt: profile.createdAt,
      })),
    };
  }
}
