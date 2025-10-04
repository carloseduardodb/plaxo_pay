import { Controller, Post, Get, Param, Query, Body, HttpStatus, UseGuards, NotFoundException, BadRequestException, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CreatePaymentUseCase } from '@/application/use-cases/create-payment.use-case';
import { PaymentService } from '@/application/services/payment.service';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentStatus } from '@/domain/entities/payment.entity';
import { DomainExceptionFilter } from '@/common/filters/domain-exception.filter';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly paymentService: PaymentService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Payment created successfully' })
  async createPayment(@Body() dto: CreatePaymentDto) {
    const command = {
      ...dto,
      currency: dto.currency || 'BRL'
    };
    
    return this.createPaymentUseCase.execute(command);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  async getPayment(@Param('id') id: string) {
    const payment = await this.paymentService.getPaymentById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  @Get('application/:applicationId')
  @ApiOperation({ summary: 'Get payments by application' })
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  async getPaymentsByApplication(
    @Param('applicationId') applicationId: string,
    @Query('status') status?: PaymentStatus
  ) {
    return this.paymentService.getPaymentsByApplication(applicationId, status);
  }

  @Get('subscription/:subscriptionId')
  @ApiOperation({ summary: 'Get payments by subscription' })
  async getPaymentsBySubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.paymentService.getPaymentsBySubscription(subscriptionId);
  }
}