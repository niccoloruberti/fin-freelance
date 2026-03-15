#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    if (key && value !== undefined) args[key] = value;
  });
  return args;
}

function printUsage() {
  console.log(`
Uso: node create-user.js --email=<email> --password=<password> --firstName=<nome> --lastName=<cognome> [opzioni]

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

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'finfreelance_user',
    password: process.env.DB_PASSWORD || 'finfreelance_pass',
    database: process.env.DB_DATABASE || 'finfreelance',
  });

  const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [args.email]);
  if (rows.length > 0) {
    console.error(`Errore: l'utente con email ${args.email} esiste già.`);
    await connection.end();
    process.exit(1);
  }

  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(args.password, 10);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await connection.execute(
    `INSERT INTO users (id, email, password, firstName, lastName, vatNumber, fiscalCode, taxRegime, taxCoefficientIncome, taxRateSubstitutive, inpsManagement, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [
      id,
      args.email,
      hashedPassword,
      args.firstName,
      args.lastName,
      args.vatNumber || null,
      args.fiscalCode || null,
      args.taxRegime || 'forfettario',
      parseFloat(args.coeff || '78'),
      parseFloat(args.rate || '15'),
      args.inps || 'gestione_separata',
      now,
      now,
    ]
  );

  console.log(`\nUtente creato con successo:`);
  console.log(`  Email:  ${args.email}`);
  console.log(`  Nome:   ${args.firstName} ${args.lastName}`);
  console.log(`  Regime: ${args.taxRegime || 'forfettario'}`);
  console.log(`  ID:     ${id}\n`);

  await connection.end();
}

main().catch((err) => {
  console.error('Errore:', err.message || err);
  process.exit(1);
});
