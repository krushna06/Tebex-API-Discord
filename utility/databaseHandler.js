const sqlite3 = require('sqlite3').verbose();

function initDatabase(dbPath) {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to SQLite database.');
            db.run(`CREATE TABLE IF NOT EXISTS users (
                discord_user_id TEXT PRIMARY KEY,
                minecraft_username TEXT NOT NULL,
                basket_ident TEXT NOT NULL
            )`);
        }
    });
    return db;
}

async function saveUser(db, discordUserId, minecraftUsername, basketIdent) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO users (discord_user_id, minecraft_username, basket_ident) VALUES (?, ?, ?)`,
            [discordUserId, minecraftUsername, basketIdent],
            (err) => {
                if (err) {
                    console.error('Error saving user:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}

async function getMinecraftUsername(db, discordUserId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT minecraft_username FROM users WHERE discord_user_id = ?`,
            [discordUserId],
            (err, row) => {
                if (err) {
                    console.error('Error fetching Minecraft username:', err.message);
                    reject(err);
                } else {
                    resolve(row ? row.minecraft_username : null);
                }
            }
        );
    });
}

async function getBasketIdent(db, discordUserId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT basket_ident FROM users WHERE discord_user_id = ?`,
            [discordUserId],
            (err, row) => {
                if (err) {
                    console.error('Error fetching basket_ident:', err.message);
                    reject(err);
                } else {
                    resolve(row ? row.basket_ident : null);
                }
            }
        );
    });
}

async function removeUser(db, discordUserId) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM users WHERE discord_user_id = ?`,
            [discordUserId],
            (err) => {
                if (err) {
                    console.error('Error removing user:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}

module.exports = { initDatabase, saveUser, getMinecraftUsername, getBasketIdent, removeUser };