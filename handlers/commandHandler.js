import { readdirSync } from 'fs';
import { Collection } from 'discord.js';

export async function loadCommands(client) {
    client.commands = new Collection();
    const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = await import(`../commands/${file}`);
        client.commands.set(command.default.data.name, command.default);
    }
}
