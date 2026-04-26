import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecurringTransactions1745700000000 implements MigrationInterface {
  name = 'AddRecurringTransactions1745700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`recurring_transactions\` (
        \`id\` varchar(36) NOT NULL,
        \`type\` enum('income','expense') NOT NULL,
        \`amount\` decimal(10,2) NOT NULL,
        \`description\` varchar(255) NOT NULL,
        \`frequency\` enum('daily','weekly','monthly','yearly') NOT NULL DEFAULT 'monthly',
        \`dayOfPeriod\` int NULL,
        \`startDate\` date NOT NULL,
        \`endDate\` date NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        \`lastGeneratedDate\` date NULL,
        \`userId\` varchar(36) NOT NULL,
        \`categoryId\` varchar(36) NULL,
        \`clientId\` varchar(36) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`recurring_transactions\`
      ADD CONSTRAINT \`FK_recurring_userId\`
      FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`recurring_transactions\`
      ADD CONSTRAINT \`FK_recurring_categoryId\`
      FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`recurring_transactions\`
      ADD CONSTRAINT \`FK_recurring_clientId\`
      FOREIGN KEY (\`clientId\`) REFERENCES \`clients\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`transactions\`
      ADD COLUMN \`recurringTransactionId\` varchar(36) NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`transactions\`
      ADD CONSTRAINT \`FK_transactions_recurringId\`
      FOREIGN KEY (\`recurringTransactionId\`) REFERENCES \`recurring_transactions\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_transactions_recurringId\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`recurringTransactionId\``);
    await queryRunner.query(`ALTER TABLE \`recurring_transactions\` DROP FOREIGN KEY \`FK_recurring_clientId\``);
    await queryRunner.query(`ALTER TABLE \`recurring_transactions\` DROP FOREIGN KEY \`FK_recurring_categoryId\``);
    await queryRunner.query(`ALTER TABLE \`recurring_transactions\` DROP FOREIGN KEY \`FK_recurring_userId\``);
    await queryRunner.query(`DROP TABLE \`recurring_transactions\``);
  }
}
