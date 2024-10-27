import { readdirSync } from 'fs';
import { Collection } from 'discord.js';

export function loadCommands(client) {
    client.commands = new Collection();
    const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        import(`../commands/${file}`).then(command => {
            client.commands.set(command.default.data.name, command.default);
        });
    }
}
