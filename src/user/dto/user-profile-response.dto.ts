import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate } from 'class-validator';

export class UserProfileResponseDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-01', required: false })
  @IsOptional()
  @IsDate()
  date_of_birth?: Date;

  @ApiProperty({ description: 'Business type', example: 'Freelancer', required: false })
  @IsOptional()
  @IsString()
  businessType?: string;
}
