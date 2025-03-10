import { Database } from "duckdb-async";
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Função para criar o banco de dados a partir do CSV
async function createDatabase() {
  console.log("Iniciando criação do banco de dados...");
  
  // Verificar se o arquivo CSV existe
  const csvPath = path.join(process.cwd(), 'bitmaps.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`Arquivo CSV não encontrado: ${csvPath}`);
    process.exit(1);
  }
  
  // Caminho do banco de dados definido no .env
  const dbPath = process.env.DB_BITMAP;
  
  // Remover o banco de dados se já existir
  if (fs.existsSync(dbPath)) {
    console.log(`Removendo banco de dados existente: ${dbPath}`);
    fs.unlinkSync(dbPath);
  }
  
  try {
    // Criar conexão com o banco de dados
    console.log(`Criando banco de dados: ${dbPath}`);
    const db = await Database.create(dbPath);
    
    // Criar tabela
    console.log("Criando tabela 'bitmaps'...");
    await db.exec(`
      CREATE TABLE bitmaps (
        bitmap INTEGER PRIMARY KEY,
        tx TEXT,
        size TEXT,
        pattern TEXT
      )
    `);
    
    // Importar dados do CSV
    console.log(`Importando dados do CSV: ${csvPath}`);
    await db.exec(`
      COPY bitmaps FROM '${csvPath}' (
        HEADER TRUE,
        DELIMITER ';'
      )
    `);
    
    // Verificar quantos registros foram importados
    const result = await db.all("SELECT COUNT(*) as count FROM bitmaps");
    console.log(`Importação concluída. Total de registros: ${result[0].count}`);
    
    // Fechar conexão
    await db.close();
    console.log("Banco de dados criado com sucesso!");
    
  } catch (error) {
    console.error("Erro ao criar banco de dados:", error);
    process.exit(1);
  }
}

// Executar a função
createDatabase(); 