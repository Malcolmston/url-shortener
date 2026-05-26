/**
 * Sequelize singleton for Next.js.
 *
 * In development, Next.js hot-reloads modules frequently. Without the global
 * variable trick, each reload creates a new Sequelize instance (and new DB
 * connections). The `global.__sequelize` pattern reuses the same instance.
 */
import { Sequelize } from 'sequelize';

declare global {
  // eslint-disable-next-line no-var
  var __sequelize: Sequelize | undefined;
}

function createSequelize(): Sequelize {
  const DB_NAME     = process.env.DB_NAME     ?? '';
  const DB_USER     = process.env.DB_USER     ?? '';
  const DB_PASSWORD = process.env.DB_PASSWORD ?? '';

  return new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host:    process.env.DB_HOST ?? 'localhost',
    port:    parseInt(process.env.DB_PORT ?? '3306', 10),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max:     5,
      min:     0,
      acquire: 30_000,
      idle:    10_000,
    },
  });
}

const sequelize: Sequelize =
  global.__sequelize ?? (global.__sequelize = createSequelize());

export default sequelize;
