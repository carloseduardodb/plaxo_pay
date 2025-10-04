import { BaseEntity } from './base.entity';

export class Application extends BaseEntity {
  constructor(
    id: string,
    public readonly name: string,
    public readonly apiKey: string,
    public readonly isActive: boolean = true,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  deactivate(): Application {
    return new Application(
      this.id,
      this.name,
      this.apiKey,
      false,
      this.createdAt,
      new Date()
    );
  }
}