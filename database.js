import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let usersDb;
let cartDb;

async function initializeUsersDatabase() {
    if (!usersDb) {
        usersDb = await open({
            filename: './database/users.sqlite',
            driver: sqlite3.Database
        });

        await usersDb.exec(`
            CREATE TABLE IF NOT EXISTS users (
                discord_id TEXT PRIMARY KEY,
                minecraft_username TEXT NOT NULL
            )
        `);
        console.log('Users table created or already exists.');
    }

    return usersDb;
}

async function initializeCartDatabase() {
    if (!cartDb) {
        cartDb = await open({
            filename: './database/cart.sqlite',
            driver: sqlite3.Database
        });

        await cartDb.exec(`
            CREATE TABLE IF NOT EXISTS cart (
                discord_id TEXT PRIMARY KEY,
                basket_ident TEXT NOT NULL
            )
        `);
        console.log('Cart table created or already exists.');
    }

    return cartDb;
}

export async function initializeDatabases() {
    await initializeUsersDatabase();
    await initializeCartDatabase();
}

export const getUsersDb = () => usersDb;
export const getCartDb = () => cartDb;
