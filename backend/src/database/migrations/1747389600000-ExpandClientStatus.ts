import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandClientStatus1747389600000 implements MigrationInterface {
  name = 'ExpandClientStatus1747389600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`clients\`
      MODIFY COLUMN \`status\` enum('lead', 'active', 'attesa', 'prenotazione', 'finalizzato', 'perso', 'archived') NOT NULL DEFAULT 'active'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`clients\`
      MODIFY COLUMN \`status\` enum('lead', 'active', 'archived') NOT NULL DEFAULT 'active'
    `);
  }
}
