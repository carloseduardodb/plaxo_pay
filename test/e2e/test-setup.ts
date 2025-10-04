import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from '@/auth/auth.module';
import { PaymentController } from '@/interfaces/controllers/payment.controller';
import { SubscriptionController } from '@/interfaces/controllers/subscription.controller';
import { ApplicationController } from '@/interfaces/controllers/application.controller';
import { PaymentService } from '@/application/services/payment.service';
import { SubscriptionService } from '@/application/services/subscription.service';
import { ApplicationService } from '@/application/services/application.service';
import { CreatePaymentUseCase } from '@/application/use-cases/create-payment.use-case';
import { CreateSubscriptionUseCase } from '@/application/use-cases/create-subscription.use-case';
import { PaymentRepositoryImpl } from '@/infrastructure/database/repositories/payment.repository.impl';
import { SubscriptionRepositoryImpl } from '@/infrastructure/database/repositories/subscription.repository.impl';
import { ApplicationRepositoryImpl } from '@/infrastructure/database/repositories/application.repository.impl';
import { MockPaymentGateway } from '@/infrastructure/gateways/mock-payment.gateway';
import { ApplicationEntity } from '@/infrastructure/database/entities/application.entity';
import { PaymentEntity } from '@/infrastructure/database/entities/payment.entity';
import { SubscriptionEntity } from '@/infrastructure/database/entities/subscription.entity';

// Load test environment variables first
require('dotenv').config({ path: '.env.test', override: true });

let app: INestApplication;
let moduleFixture: TestingModule;

export const setupTestApp = async (): Promise<INestApplication> => {
  if (!app) {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST') || 'localhost',
            port: configService.get('DB_PORT') || 5432,
            username: configService.get('DB_USERNAME') || 'postgres',
            password: configService.get('DB_PASSWORD') || 'postgres',
            database: configService.get('DB_DATABASE') || 'plaxo_pay_test',
            entities: [ApplicationEntity, PaymentEntity, SubscriptionEntity],
            synchronize: true,
            dropSchema: true,
            logging: false,
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([ApplicationEntity, PaymentEntity, SubscriptionEntity]),
        EventEmitterModule.forRoot(),
        AuthModule,
      ],
      controllers: [PaymentController, SubscriptionController, ApplicationController],
      providers: [
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
        {
          provide: 'PaymentGateway',
          useClass: MockPaymentGateway,
        },
        CreatePaymentUseCase,
        CreateSubscriptionUseCase,
        PaymentService,
        SubscriptionService,
        ApplicationService,
      ],
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }
  return app;
};

export const closeTestApp = async (): Promise<void> => {
  if (app) {
    await app.close();
    app = null;
    moduleFixture = null;
  }
};