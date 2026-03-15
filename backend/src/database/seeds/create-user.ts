import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { User } from '../../modules/users/entities/user.entity';
import { Transaction } from '../../modules/transactions/entities/transaction.entity';
import { Client } from '../../modules/clients/entities/client.entity';
import { Category } from '../../modules/categories/entities/category.entity';

config();

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  process.argv.slice(2).forEach((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    if (key && value !== undefined) args[key] = value;
  });
  return args;
}

function printUsage() {
  console.log(`
Uso: npm run create-user -- --email=<email> --password=<password> --firstName=<nome> --lastName=<cognome> [opzioni]

Opzioni obbligatorie:
  --email         Email dell'utente
  --password      Password (min 8 caratteri)
  --firstName     Nome
  --lastName      Cognome

Opzioni facoltative:
  --vatNumber     Partita IVA
  --fiscalCode    Codice fiscale
  --taxRegime     forfettario | ordinario (default: forfettario)
  --coeff         Coefficiente di redditività in % (default: 78)
  --rate          Aliquota sostitutiva in % (default: 15)
  --inps          gestione_separata | cassa_professionale | artigiani_commercianti (default: gestione_separata)

Esempio:
  npm run create-user -- --email=mario@example.com --password=Sicuro123! --firstName=Mario --lastName=Rossi
`);
}

async function main() {
  const args = parseArgs();

  if (!args.email || !args.password || !args.firstName || !args.lastName) {
    console.error('Errore: email, password, firstName e lastName sono obbligatori.\n');
    printUsage();
    process.exit(1);
  }

  if (args.password.length < 8) {
    console.error('Errore: la password deve essere di almeno 8 caratteri.');
    process.exit(1);
  }

  const validRegimes = ['forfettario', 'ordinario'];
  if (args.taxRegime && !validRegimes.includes(args.taxRegime)) {
    console.error(`Errore: taxRegime deve essere uno tra: ${validRegimes.join(', ')}`);
    process.exit(1);
  }

  const validInps = ['gestione_separata', 'cassa_professionale', 'artigiani_commercianti'];
  if (args.inps && !validInps.includes(args.inps)) {
    console.error(`Errore: inps deve essere uno tra: ${validInps.join(', ')}`);
    process.exit(1);
  }

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

  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email: args.email } });

  if (existing) {
    console.error(`Errore: l'utente con email ${args.email} esiste già.`);
    await dataSource.destroy();
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(args.password, 10);

  const user = userRepo.create({
    email: args.email,
    password: hashedPassword,
    firstName: args.firstName,
    lastName: args.lastName,
    vatNumber: args.vatNumber || null,
    fiscalCode: args.fiscalCode || null,
    taxRegime: (args.taxRegime as 'forfettario' | 'ordinario') || 'forfettario',
    taxCoefficientIncome: args.coeff ? parseFloat(args.coeff) : 78,
    taxRateSubstitutive: args.rate ? parseFloat(args.rate) : 15,
    inpsManagement: (args.inps as any) || 'gestione_separata',
    isActive: true,
  });

  await userRepo.save(user);

  console.log(`\nUtente creato con successo:`);
  console.log(`  Email:      ${user.email}`);
  console.log(`  Nome:       ${user.firstName} ${user.lastName}`);
  console.log(`  Regime:     ${user.taxRegime}`);
  console.log(`  ID:         ${user.id}\n`);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Errore:', err.message || err);
  process.exit(1);
});
