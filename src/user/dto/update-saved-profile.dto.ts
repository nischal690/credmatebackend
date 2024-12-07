import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateSavedProfileDto {
  @ApiProperty({
    description: 'UUID of the user whose transaction count to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  savedUserId: string;

  @ApiProperty({
    description: 'Number of transactions between users',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  transactionCount: number;
}
