import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';
import { REST, Routes } from 'discord.js';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { BOT_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

await loadCommands(client);
loadEvents(client);

client.on('ready', async () => {

    const commandData = client.commands.map(command => command.data.toJSON());

    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

    try {
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commandData },
        );
        console.log('Registered the slash commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

client.login(BOT_TOKEN);
