import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInpsManagement1740100000000 implements MigrationInterface {
  name = 'AddInpsManagement1740100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD COLUMN \`inpsManagement\` enum('gestione_separata', 'cassa_professionale', 'artigiani_commercianti')
      NOT NULL DEFAULT 'gestione_separata'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\` DROP COLUMN \`inpsManagement\`
    `);
  }
}
