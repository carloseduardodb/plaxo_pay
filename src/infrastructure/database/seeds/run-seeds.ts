import { AppDataSource } from '../data-source';
import { ApplicationSeed } from './application.seed';
import { SubscriptionSeed } from './subscription.seed';
import { PaymentSeed } from './payment.seed';

async function runSeeds() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    
    console.log('Running seeds...');
    
    await ApplicationSeed.run(AppDataSource);
    await SubscriptionSeed.run(AppDataSource);
    await PaymentSeed.run(AppDataSource);
    
    console.log('Seeds completed successfully!');
  } catch (error) {
    console.error('Error running seeds:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeds();