import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'finfreelance_user',
  password: process.env.DB_PASSWORD || 'finfreelance_pass',
  database: process.env.DB_DATABASE || 'finfreelance',
  // Don't load entities during migrations to avoid circular dependency issues
  entities: [],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
