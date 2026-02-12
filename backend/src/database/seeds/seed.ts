import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { User } from '../../modules/users/entities/user.entity';
import { Transaction } from '../../modules/transactions/entities/transaction.entity';
import { Client } from '../../modules/clients/entities/client.entity';
import { Category } from '../../modules/categories/entities/category.entity';

config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'finfreelance_user',
  password: process.env.DB_PASSWORD || 'finfreelance_pass',
  database: process.env.DB_DATABASE || 'finfreelance',
  entities: [User, Transaction, Client, Category],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);

  const email = 'admin@finfreelance.it';
  const existing = await userRepo.findOne({ where: { email } });

  if (existing) {
    console.log(`User ${email} already exists, skipping.`);
  } else {
    const password = await bcrypt.hash('Admin1234!', 10);
    const user = userRepo.create({
      email,
      password,
      firstName: 'Admin',
      lastName: 'User',
      taxRegime: 'forfettario',
      taxCoefficientIncome: 78,
      taxRateSubstitutive: 15,
      isActive: true,
    });
    await userRepo.save(user);
    console.log(`Admin user created: ${email} / Admin1234!`);
  }

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
