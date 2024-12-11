import { IsString, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportBorrowerDto {
  @ApiProperty({ description: 'Mobile number of the borrower' })
  @IsString()
  mobileNumber: string;

  @ApiProperty({ description: 'Amount that remains unpaid' })
  @IsNumber()
  unpaidAmount: number;

  @ApiProperty({ description: 'Due date for the payment' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Whether to enable recovery mode' })
  @IsBoolean()
  recoveryMode: boolean;
}
