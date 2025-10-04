import { IsString, IsNumber, IsEnum, IsOptional, IsObject, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@/domain/entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Application ID' })
  @IsUUID()
  applicationId: string;

  @ApiProperty({ description: 'Payment amount', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'BRL' })
  @IsString()
  @IsOptional()
  currency?: string = 'BRL';

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ description: 'Payment description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Customer ID', required: false })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ description: 'Subscription ID for recurring payments', required: false })
  @IsUUID()
  @IsOptional()
  subscriptionId?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}