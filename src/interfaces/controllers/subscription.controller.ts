import { Controller, Post, Get, Param, Query, Body, Put, HttpStatus, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CreateSubscriptionUseCase } from '@/application/use-cases/create-subscription.use-case';
import { SubscriptionService } from '@/application/services/subscription.service';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { SubscriptionStatus } from '@/domain/entities/subscription.entity';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly subscriptionService: SubscriptionService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Subscription created successfully' })
  async createSubscription(@Body() dto: CreateSubscriptionDto) {
    const command = {
      ...dto,
      currency: dto.currency || 'BRL',
      startDate: dto.startDate ? new Date(dto.startDate) : undefined
    };
    
    return this.createSubscriptionUseCase.execute(command);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subscription found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Subscription not found' })
  async getSubscription(@Param('id') id: string) {
    const subscription = await this.subscriptionService.getSubscriptionById(id);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  @Get('application/:applicationId')
  @ApiOperation({ summary: 'Get subscriptions by application' })
  @ApiQuery({ name: 'status', enum: SubscriptionStatus, required: false })
  async getSubscriptionsByApplication(
    @Param('applicationId') applicationId: string,
    @Query('status') status?: SubscriptionStatus
  ) {
    return this.subscriptionService.getSubscriptionsByApplication(applicationId, status);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get subscriptions by customer' })
  async getSubscriptionsByCustomer(@Param('customerId') customerId: string) {
    return this.subscriptionService.getSubscriptionsByCustomer(customerId);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancelSubscription(@Param('id') id: string) {
    return this.subscriptionService.cancelSubscription(id);
  }

  @Put(':id/suspend')
  @ApiOperation({ summary: 'Suspend subscription' })
  async suspendSubscription(@Param('id') id: string) {
    return this.subscriptionService.suspendSubscription(id);
  }

  @Get('renewals/due')
  @ApiOperation({ summary: 'Get subscriptions due for renewal' })
  async getSubscriptionsDueForRenewal() {
    return this.subscriptionService.getSubscriptionsDueForRenewal();
  }
}