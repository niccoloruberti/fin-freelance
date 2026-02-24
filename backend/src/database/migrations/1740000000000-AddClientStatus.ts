import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientStatus1740000000000 implements MigrationInterface {
  name = 'AddClientStatus1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`clients\`
      ADD COLUMN \`status\` enum('lead', 'active', 'archived') NOT NULL DEFAULT 'active'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`clients\` DROP COLUMN \`status\`
    `);
  }
}
