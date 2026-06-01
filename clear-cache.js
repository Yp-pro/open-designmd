const fs = require('fs');
const path = require('path');

// Простая функция чтения .env без использования внешних библиотек
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
}

loadEnv();

const url = process.env.designmd_TURSO_DATABASE_URL;
const authToken = process.env.designmd_TURSO_AUTH_TOKEN;

if (!url) {
  console.log("Database URL is not configured in .env.");
  console.log("You are running in no-cache mode. Cache is already empty.");
  process.exit(0);
}

// Пакет @libsql/client уже гарантированно установлен в вашем проекте
const { createClient } = require('@libsql/client');

async function main() {
  console.log("Connecting to database:", url);
  const client = createClient({ url, authToken });
  try {
    // Удаляем таблицу кэша. Next.js автоматически воссоздаст её пустой при следующем поиске домена.
    await client.execute("DROP TABLE IF EXISTS domain_cache;");
    console.log("\nSuccess: Database cache table 'domain_cache' has been dropped!");
    console.log("A fresh schema will be generated on your next search.");
  } catch (e) {
    console.error("\nError: Failed to clear database cache:", e.message);
  }
}

main();