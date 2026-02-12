import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1706388000000 implements MigrationInterface {
    name = 'InitialSchema1706388000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`firstName\` varchar(255) NOT NULL,
                \`lastName\` varchar(255) NOT NULL,
                \`vatNumber\` varchar(255) NULL,
                \`fiscalCode\` varchar(255) NULL,
                \`taxRegime\` enum ('forfettario', 'ordinario') NOT NULL DEFAULT 'forfettario',
                \`taxCoefficientIncome\` decimal(5,2) NOT NULL DEFAULT '78.00',
                \`taxRateSubstitutive\` decimal(5,2) NOT NULL DEFAULT '15.00',
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_users_email\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create categories table
        await queryRunner.query(`
            CREATE TABLE \`categories\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`type\` enum ('income', 'expense', 'both') NOT NULL DEFAULT 'both',
                \`icon\` varchar(255) NULL,
                \`color\` varchar(255) NULL,
                \`isDefault\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create clients table
        await queryRunner.query(`
            CREATE TABLE \`clients\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`email\` varchar(255) NULL,
                \`phone\` varchar(255) NULL,
                \`vatNumber\` varchar(255) NULL,
                \`fiscalCode\` varchar(255) NULL,
                \`address\` text NULL,
                \`city\` varchar(255) NULL,
                \`postalCode\` varchar(255) NULL,
                \`country\` varchar(255) NULL,
                \`notes\` text NULL,
                \`userId\` varchar(36) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create transactions table
        await queryRunner.query(`
            CREATE TABLE \`transactions\` (
                \`id\` varchar(36) NOT NULL,
                \`type\` enum ('income', 'expense') NOT NULL,
                \`amount\` decimal(10,2) NOT NULL,
                \`description\` varchar(255) NOT NULL,
                \`date\` date NOT NULL,
                \`invoiceNumber\` varchar(255) NULL,
                \`isRecurring\` tinyint NOT NULL DEFAULT 0,
                \`userId\` varchar(36) NOT NULL,
                \`categoryId\` varchar(36) NULL,
                \`clientId\` varchar(36) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Add foreign keys
        await queryRunner.query(`
            ALTER TABLE \`clients\` 
            ADD CONSTRAINT \`FK_clients_userId\` 
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`transactions\` 
            ADD CONSTRAINT \`FK_transactions_userId\` 
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`transactions\` 
            ADD CONSTRAINT \`FK_transactions_categoryId\` 
            FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) 
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`transactions\` 
            ADD CONSTRAINT \`FK_transactions_clientId\` 
            FOREIGN KEY (\`clientId\`) REFERENCES \`clients\`(\`id\`) 
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        // Insert default categories
        await queryRunner.query(`
            INSERT INTO \`categories\` (\`id\`, \`name\`, \`type\`, \`icon\`, \`color\`, \`isDefault\`, \`createdAt\`, \`updatedAt\`) VALUES
            (UUID(), 'Consulenza', 'income', '💼', '#10B981', 1, NOW(), NOW()),
            (UUID(), 'Sviluppo Software', 'income', '💻', '#3B82F6', 1, NOW(), NOW()),
            (UUID(), 'Formazione', 'income', '📚', '#8B5CF6', 1, NOW(), NOW()),
            (UUID(), 'Design', 'income', '🎨', '#EC4899', 1, NOW(), NOW()),
            (UUID(), 'Marketing', 'income', '📈', '#F59E0B', 1, NOW(), NOW()),
            (UUID(), 'Software/Tools', 'expense', '🛠️', '#6B7280', 1, NOW(), NOW()),
            (UUID(), 'Formazione', 'expense', '📖', '#8B5CF6', 1, NOW(), NOW()),
            (UUID(), 'Ufficio', 'expense', '🏢', '#059669', 1, NOW(), NOW()),
            (UUID(), 'Marketing', 'expense', '📣', '#F59E0B', 1, NOW(), NOW()),
            (UUID(), 'Trasporti', 'expense', '🚗', '#EF4444', 1, NOW(), NOW()),
            (UUID(), 'Altro', 'both', '📦', '#6B7280', 1, NOW(), NOW())
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_transactions_clientId\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_transactions_categoryId\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_transactions_userId\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP FOREIGN KEY \`FK_clients_userId\``);
        await queryRunner.query(`DROP TABLE \`transactions\``);
        await queryRunner.query(`DROP TABLE \`clients\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }
}
