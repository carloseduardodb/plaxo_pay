import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSubscriptionsTable1703000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'applicationId',
            type: 'uuid',
          },
          {
            name: 'planName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'BRL'",
          },
          {
            name: 'billingCycle',
            type: 'enum',
            enum: ['monthly', 'quarterly', 'yearly'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'cancelled', 'suspended', 'expired'],
            default: "'active'",
          },
          {
            name: 'startDate',
            type: 'timestamp',
          },
          {
            name: 'nextBillingDate',
            type: 'timestamp',
          },
          {
            name: 'customerId',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'subscriptions',
      new TableForeignKey({
        columnNames: ['applicationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'applications',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscriptions');
  }
}