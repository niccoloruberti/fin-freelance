import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveInvoiceNumberFromTransactions1747500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`invoiceNumber\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`invoiceNumber\` varchar(255) NULL`);
  }
}
