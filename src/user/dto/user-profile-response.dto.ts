import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate, IsUUID } from 'class-validator';

export class UserProfileResponseDto {
  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-01', required: false })
  @IsOptional()
  @IsDate()
  date_of_birth?: Date;

  @ApiProperty({ description: 'Business type', example: 'Freelancer', required: false })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiProperty({ description: 'Profile image URL', example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiProperty({ description: 'Phone number', example: '+919876543210' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Aadhaar number', example: '123456789012', required: false })
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @ApiProperty({ description: 'PAN number', example: 'ABCDE1234F', required: false })
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  @IsDate()
  updatedAt: Date;
}
