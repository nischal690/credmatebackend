import { ApiProperty } from '@nestjs/swagger';

export class SaveProfileResponseDto {
  @ApiProperty({
    description: 'UUID of the saved profile entry',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'UUID of the user who saved the profile',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  savedByUserId: string;

  @ApiProperty({
    description: 'UUID of the user who was saved',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  savedUserId: string;

  @ApiProperty({
    description: 'Timestamp when the profile was saved',
    example: '2024-12-08T02:35:20+05:30',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Whether the saved profile is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Number of transactions between users',
    example: 0,
  })
  transactionCount: number;

  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;
}
