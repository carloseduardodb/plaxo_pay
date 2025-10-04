import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationRepository } from '@/domain/repositories/application.repository';
import { Application } from '@/domain/entities/application.entity';
import { ApplicationEntity } from '../entities/application.entity';

@Injectable()
export class ApplicationRepositoryImpl implements ApplicationRepository {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly repository: Repository<ApplicationEntity>
  ) {}

  async save(application: Application): Promise<Application> {
    const entity = this.toEntity(application);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Application | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByApiKey(apiKey: string): Promise<Application | null> {
    const entity = await this.repository.findOne({ where: { apiKey } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Application[]> {
    const entities = await this.repository.find();
    return entities.map(entity => this.toDomain(entity));
  }

  async update(application: Application): Promise<Application> {
    const entity = this.toEntity(application);
    const updated = await this.repository.save(entity);
    return this.toDomain(updated);
  }

  private toDomain(entity: ApplicationEntity): Application {
    return new Application(
      entity.id,
      entity.name,
      entity.apiKey,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt
    );
  }

  private toEntity(application: Application): ApplicationEntity {
    const entity = new ApplicationEntity();
    entity.id = application.id;
    entity.name = application.name;
    entity.apiKey = application.apiKey;
    entity.isActive = application.isActive;
    entity.createdAt = application.createdAt;
    entity.updatedAt = application.updatedAt;
    return entity;
  }
}