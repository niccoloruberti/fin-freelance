import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MoveIsTaxableToTransactions1745800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('categories', 'isTaxable');

    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'isTaxable',
        type: 'tinyint',
        width: 1,
        default: 1,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'recurring_transactions',
      new TableColumn({
        name: 'isTaxable',
        type: 'tinyint',
        width: 1,
        default: 1,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('recurring_transactions', 'isTaxable');
    await queryRunner.dropColumn('transactions', 'isTaxable');

    await queryRunner.addColumn(
      'categories',
      new TableColumn({
        name: 'isTaxable',
        type: 'tinyint',
        width: 1,
        default: 1,
        isNullable: false,
      }),
    );
  }
}
