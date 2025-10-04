import { DataSource } from 'typeorm';
import { ApplicationEntity } from './entities/application.entity';
import { PaymentEntity } from './entities/payment.entity';
import { SubscriptionEntity } from './entities/subscription.entity';

require('dotenv').config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'plaxo_pay',
  synchronize: false,
  logging: true,
  entities: [ApplicationEntity, PaymentEntity, SubscriptionEntity],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  subscribers: ['src/infrastructure/database/subscribers/*.ts'],
});