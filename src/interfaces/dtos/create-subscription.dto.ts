import { IsString, IsNumber, IsEnum, IsOptional, IsObject, IsDateString, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingCycle } from '@/domain/entities/subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Application ID' })
  @IsUUID()
  applicationId: string;

  @ApiProperty({ description: 'Plan name' })
  @IsString()
  planName: string;

  @ApiProperty({ description: 'Subscription amount', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'BRL' })
  @IsString()
  @IsOptional()
  currency?: string = 'BRL';

  @ApiProperty({ enum: BillingCycle, description: 'Billing cycle' })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiProperty({ description: 'Subscription start date', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}