import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsTaxableToCategories1743600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('categories', 'isTaxable');
  }
}
