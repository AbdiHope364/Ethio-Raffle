const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetProvider = process.argv[2] || 'postgresql';
const schemaPath = path.join(__dirname, '..', 'packages', 'database', 'prisma', 'schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error('schema.prisma not found at:', schemaPath);
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

if (targetProvider === 'postgresql' || targetProvider === 'postgres' || targetProvider === 'pg') {
  schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  console.log('Switched Prisma datasource provider to: postgresql (Production Cloud Mode)');
} else if (targetProvider === 'sqlite') {
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  console.log('Switched Prisma datasource provider to: sqlite (Local Development Mode)');
} else {
  console.error('Invalid provider. Choose "postgresql" or "sqlite"');
  process.exit(1);
}

fs.writeFileSync(schemaPath, schema, 'utf8');

try {
  console.log('Running prisma generate...');
  execSync('npm --workspace=@raffle/database run db:generate', { stdio: 'inherit' });
  console.log('Database configuration updated successfully!');
} catch (e) {
  console.error('Failed to regenerate prisma client:', e.message);
}

