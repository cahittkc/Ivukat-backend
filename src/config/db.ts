import { DataSource } from 'typeorm';
import { join } from 'path';
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'ivukat-v2',
    synchronize: process.env.NODE_ENV === 'development', // Sadece development ortamında true olmalı
    entities: [join(__dirname, '..', 'entities', '*.{ts,js}')],
    migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
}); 