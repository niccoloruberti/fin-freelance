import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientLookups1747390500000 implements MigrationInterface {
  name = 'AddClientLookups1747390500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`client_lookups\` (
        \`id\`        varchar(36)                    NOT NULL,
        \`name\`      varchar(255)                   NOT NULL,
        \`type\`      enum('source','service')        NOT NULL,
        \`userId\`    varchar(36)                    NOT NULL,
        \`createdAt\` datetime(6)                    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`clients\`
      ADD COLUMN \`source\`  varchar(255) NULL,
      ADD COLUMN \`service\` varchar(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`service\`, DROP COLUMN \`source\``);
    await queryRunner.query(`DROP TABLE \`client_lookups\``);
  }
}
