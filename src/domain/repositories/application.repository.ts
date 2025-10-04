import { Application } from '../entities/application.entity';

export interface ApplicationRepository {
  save(application: Application): Promise<Application>;
  findById(id: string): Promise<Application | null>;
  findByApiKey(apiKey: string): Promise<Application | null>;
  findAll(): Promise<Application[]>;
  update(application: Application): Promise<Application>;
}