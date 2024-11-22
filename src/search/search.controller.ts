import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchService } from './search.service';
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

  // Future search endpoints can be added here
  // @Post('text')
  // async searchByText(@Body() dto: SearchTextDto) { ... }
}
