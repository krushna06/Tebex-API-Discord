const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { initDatabase, removeUser } = require('./utility/databaseHandler');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.db = initDatabase('./database/users.sqlite');
client.userLoginTimestamps = new Map();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

setInterval(async () => {
    const now = Date.now();

    for (const [userId, loginTime] of client.userLoginTimestamps.entries()) {
        if (now - loginTime > 8.64e+10) {
            try {
                await removeUser(client.db, userId);
                console.log(`User ${userId} has been logged out automatically.`);
                client.userLoginTimestamps.delete(userId);
            } catch (error) {
                console.error(`Error logging out user ${userId}:`, error.message);
            }
        }
    }
}, 60000);


client.login(process.env.DISCORD_TOKEN);
