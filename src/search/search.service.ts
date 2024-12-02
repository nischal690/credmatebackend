import { Injectable, BadRequestException } from '@nestjs/common';
import { FaceRecognitionService } from './services/face-recognition.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { UserProfileResponse } from '../user/interfaces/user-profile.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(
    private readonly faceRecognitionService: FaceRecognitionService,
    private readonly prisma: PrismaService,
  ) {}

  async searchByFace(imageBuffer: Buffer) {
    return this.faceRecognitionService.searchFaceByImage(imageBuffer);
  }

  async searchByMobileNumber(
    phoneNumber: string,
  ): Promise<UserProfileResponse | null> {
    if (!phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
      select: {
        name: true,
        date_of_birth: true,
        businessType: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async searchById(userId: string): Promise<UserProfileResponse | null> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        date_of_birth: true,
        businessType: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async searchByAadhar(
    aadhaarNumber: string,
  ): Promise<UserProfileResponse | null> {
    console.log('Input Aadhaar number type:', typeof aadhaarNumber);
    console.log('Input Aadhaar number:', aadhaarNumber);

    if (!aadhaarNumber) {
      throw new BadRequestException('Aadhaar number is required');
    }

    // Convert to string and ensure exact format
    const formattedAadhaar = aadhaarNumber.toString().padStart(12, '0');
    console.log('Formatted Aadhaar:', formattedAadhaar);

    // Validate Aadhaar number format (12 digits)
    if (!/^\d{12}$/.test(formattedAadhaar)) {
      throw new BadRequestException(
        'Invalid Aadhaar number format. Must be 12 digits',
      );
    }

    // First, let's check if any users exist
    const allUsers = await this.prisma.user.findMany({
      take: 5,
    });
    console.log('First 5 users in database:', allUsers);

    // Try raw query to debug
    const rawUsers = await this.prisma.$queryRaw`
      SELECT * FROM users WHERE "aadhaarNumber" = ${formattedAadhaar};
    `;
    console.log('Raw query result:', rawUsers);

    const user = await this.prisma.user.findFirst({
      where: {
        aadhaarNumber: formattedAadhaar,
      } as Prisma.UserWhereInput,
      select: {
        name: true,
        date_of_birth: true,
        businessType: true,
      },
    });

    console.log('Prisma query result:', user);

    if (!user) {
      return null;
    }

    return user;
  }

  async searchByPanNumber(
    panNumber: string,
  ): Promise<UserProfileResponse | null> {
    if (!panNumber) {
      throw new BadRequestException('PAN number is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { panNumber } as unknown as Prisma.UserWhereUniqueInput,
      select: {
        name: true,
        date_of_birth: true,
        businessType: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  // Future search methods can be added here
  // async searchByText(query: string) { ... }
  // async searchByLocation(coordinates: { lat: number; lng: number }) { ... }
}
