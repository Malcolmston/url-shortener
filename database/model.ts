import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const DB_NAME = process.env.DB_NAME || '';
const DB_USERNAME = process.env.DB_USER || '';
const DB_PASSWORD = process.env.DB_PASSWORD || '';


const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql'
});


export default sequelize;
