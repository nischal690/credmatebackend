import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { FirebaseService } from '../auth/firebase.service';
import { AuthService } from '../auth/auth.service';
import { CustomJwtPayload } from '../auth/auth.service';
import { BaseService } from '../common/base/base.service';
import { ValidationUtils } from '../common/utils/validation.utils';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { UserProfileResponse } from './interfaces/user-profile.interface';

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
  ) {
    super(prismaService);
  }

  async getUserProfile(token: string): Promise<UserProfileResponse> {
    const decodedToken = await this.authService.verifyCustomToken(token);
    ValidationUtils.validateRequiredFields(decodedToken, ['uniqueId']);

    const user = await this.findOne('user', { uniqueId: decodedToken.uniqueId }, {
      name: true,
      date_of_birth: true,
      businessType: true,
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateUserProfile(
    decodedToken: CustomJwtPayload,
    userData: UpdateUserProfileDto,
  ): Promise<UserProfileResponse> {
    ValidationUtils.validateRequiredFields(decodedToken, ['uniqueId']);
    await ValidationUtils.validateDTO(userData);

    const updateData = this.filterUpdateData(userData);
    
    return this.update(
      'user',
      { uniqueId: decodedToken.uniqueId },
      updateData,
      {
        name: true,
        date_of_birth: true,
        businessType: true,
      }
    );
  }

  private filterUpdateData(userData: UpdateUserProfileDto): any {
    const updateData: any = {};
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.date_of_birth !== undefined) updateData.date_of_birth = new Date(userData.date_of_birth);
    if (userData.businessType !== undefined) updateData.businessType = userData.businessType;
    return updateData;
  }
}
