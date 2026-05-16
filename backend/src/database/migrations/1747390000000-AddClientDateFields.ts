import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientDateFields1747390000000 implements MigrationInterface {
  name = 'AddClientDateFields1747390000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`clients\`
      ADD COLUMN \`contactDate\` date NULL,
      ADD COLUMN \`lastContactDate\` date NULL,
      ADD COLUMN \`birthDate\` date NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`clients\`
      DROP COLUMN \`contactDate\`,
      DROP COLUMN \`lastContactDate\`,
      DROP COLUMN \`birthDate\`
    `);
  }
}
