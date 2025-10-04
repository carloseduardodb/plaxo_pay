import { DataSource } from 'typeorm';
import { ApplicationEntity } from '../entities/application.entity';
import { v4 as uuid } from 'uuid';

export class ApplicationSeed {
  public static async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(ApplicationEntity);

    const applications = [
      {
        id: uuid(),
        name: 'E-commerce App',
        apiKey: 'ecommerce_api_key_123',
        isActive: true,
      },
      {
        id: uuid(),
        name: 'SaaS Platform',
        apiKey: 'saas_api_key_456',
        isActive: true,
      },
      {
        id: uuid(),
        name: 'Mobile App',
        apiKey: 'mobile_api_key_789',
        isActive: true,
      },
    ];

    for (const appData of applications) {
      const existingApp = await repository.findOne({ where: { apiKey: appData.apiKey } });
      if (!existingApp) {
        const app = repository.create(appData);
        await repository.save(app);
        console.log(`Created application: ${appData.name}`);
      }
    }
  }
}