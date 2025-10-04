import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Entities
import { ApplicationEntity } from './infrastructure/database/entities/application.entity';
import { PaymentEntity } from './infrastructure/database/entities/payment.entity';
import { SubscriptionEntity } from './infrastructure/database/entities/subscription.entity';

// Repositories
import { PaymentRepository } from './domain/repositories/payment.repository';
import { SubscriptionRepository } from './domain/repositories/subscription.repository';
import { ApplicationRepository } from './domain/repositories/application.repository';
import { PaymentRepositoryImpl } from './infrastructure/database/repositories/payment.repository.impl';
import { SubscriptionRepositoryImpl } from './infrastructure/database/repositories/subscription.repository.impl';
import { ApplicationRepositoryImpl } from './infrastructure/database/repositories/application.repository.impl';

// Gateways
import { PaymentGateway } from './domain/gateways/payment-gateway.interface';
import { MercadoPagoGateway } from './infrastructure/gateways/mercado-pago.gateway';

// Use Cases
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { CreateSubscriptionUseCase } from './application/use-cases/create-subscription.use-case';

// Services
import { PaymentService } from './application/services/payment.service';
import { SubscriptionService } from './application/services/subscription.service';
import { ApplicationService } from './application/services/application.service';

// Controllers
import { PaymentController } from './interfaces/controllers/payment.controller';
import { SubscriptionController } from './interfaces/controllers/subscription.controller';
import { ApplicationController } from './interfaces/controllers/application.controller';

// Auth
import { AuthModule } from './auth/auth.module';

// Events
import { EventModule } from './infrastructure/events/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [ApplicationEntity, PaymentEntity, SubscriptionEntity],
        synchronize: false,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ApplicationEntity, PaymentEntity, SubscriptionEntity]),
    EventEmitterModule.forRoot(),
    AuthModule,
    EventModule,
  ],
  controllers: [PaymentController, SubscriptionController, ApplicationController],
  providers: [
    // Repositories
    {
      provide: 'PaymentRepository',
      useClass: PaymentRepositoryImpl,
    },
    {
      provide: 'SubscriptionRepository',
      useClass: SubscriptionRepositoryImpl,
    },
    {
      provide: 'ApplicationRepository',
      useClass: ApplicationRepositoryImpl,
    },
    // Gateways
    {
      provide: 'PaymentGateway',
      useClass: MercadoPagoGateway,
    },
    // Use Cases
    CreatePaymentUseCase,
    CreateSubscriptionUseCase,
    // Services
    PaymentService,
    SubscriptionService,
    ApplicationService,
  ],
})
export class AppModule {}