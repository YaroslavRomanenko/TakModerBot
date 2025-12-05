import { DataSource } from "typeorm";
import { User } from "./entities/user.js";
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ?? 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  ssl: process.env.DB_SSL,
  
  synchronize: false,
  logging: true,
  entities: [User],
  subscribers: [],
  migrations: [],
});