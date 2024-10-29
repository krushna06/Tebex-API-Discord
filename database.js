import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db = await open({
    filename: './database/users.sqlite',
    driver: sqlite3.Database
});

// Create the users table if it doesn't exist
await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        discord_id TEXT PRIMARY KEY,
        minecraft_username TEXT NOT NULL
    )
`);
