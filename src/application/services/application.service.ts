import { Injectable, Inject } from '@nestjs/common';
import { ApplicationRepository } from '@/domain/repositories/application.repository';
import { Application } from '@/domain/entities/application.entity';
import { v4 as uuid } from 'uuid';

export interface CreateApplicationCommand {
  name: string;
  apiKey: string;
  isActive?: boolean;
}

@Injectable()
export class ApplicationService {
  constructor(
    @Inject('ApplicationRepository') private readonly applicationRepository: ApplicationRepository
  ) {}

  async createApplication(command: CreateApplicationCommand): Promise<Application> {
    const application = new Application(
      uuid(),
      command.name,
      command.apiKey,
      command.isActive ?? true
    );

    return this.applicationRepository.save(application);
  }

  async getApplicationById(id: string): Promise<Application | null> {
    return this.applicationRepository.findById(id);
  }

  async getAllApplications(): Promise<Application[]> {
    return this.applicationRepository.findAll();
  }

  async getApplicationByApiKey(apiKey: string): Promise<Application | null> {
    return this.applicationRepository.findByApiKey(apiKey);
  }
}