import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
  NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchService } from './search.service';
import { UserProfileResponse } from '../user/interfaces/user-profile.interface';
import { UserProfileResponseDto } from '../user/dto/user-profile-response.dto';
import type { Express } from 'express';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('face')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Search by face',
    description:
      'Search for a user by comparing face with stored profile images',
  })
  @UseInterceptors(FileInterceptor('image'))
  async searchByFace(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }
    return this.searchService.searchByFace(file.buffer);
  }

  @Get('mobile/:phonenumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Search user by mobile number' })
  @ApiResponse({ status: 200, description: 'User found', type: UserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async searchByMobileNumber(@Param('phonenumber') phoneNumber: string) {
    const user = await this.searchService.searchByMobileNumber(phoneNumber);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('id/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Search user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async searchById(@Param('userId') userId: string) {
    const user = await this.searchService.searchById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('aadhar/:aadharNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Search user by Aadhar number' })
  @ApiResponse({ status: 200, description: 'User found', type: UserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid Aadhar number format' })
  async searchByAadhar(@Param('aadharNumber') aadharNumber: string) {
    const user = await this.searchService.searchByAadhar(aadharNumber);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('pan/:pannumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Search user by PAN number' })
  @ApiResponse({ status: 200, description: 'User found', type: UserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async searchByPanNumber(@Param('pannumber') panNumber: string) {
    const user = await this.searchService.searchByPanNumber(panNumber);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Future search endpoints can be added here
  // @Post('text')
  // async searchByText(@Body() dto: SearchTextDto) { ... }
}
