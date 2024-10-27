import { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const { BOT_TOKEN, TEBEX_TOKEN } = process.env;
const BOT_ID = '1038037031982481548';
const GUILD_ID = '877062059966206002';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
(async () => {
    try {
        console.log('Refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(BOT_ID, GUILD_ID),
            { body: [{ name: 'storeinfo', description: 'Get store information from Tebex' }] },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'storeinfo') {
        try {
            const response = await fetch(`https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}`, {
                headers: { Authorization: `Bearer ${TEBEX_TOKEN}` }
            });

            if (!response.ok) {
                return interaction.reply({ content: 'Failed to fetch store information.', ephemeral: true });
            }

            const data = await response.json();

            const {
                id,
                name,
                description,
                webstore_url,
                currency,
                lang,
                platform_type,
                created_at
            } = data.data;

            const embed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle(`${name} Store Information`)
                .setDescription(description.replace(/<\/?[^>]+(>|$)/g, ""))
                .addFields(
                    { name: 'Webstore URL', value: webstore_url, inline: true },
                    { name: 'Currency', value: currency, inline: true },
                    { name: 'Language', value: lang, inline: true },
                    { name: 'Platform', value: platform_type, inline: true },
                    { name: 'Store Created', value: new Date(created_at).toLocaleDateString(), inline: true }
                )
                .setFooter({ text: `Store ID: ${id}` });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'An error occurred while fetching the store information.', ephemeral: true });
        }
    }
});

client.login(BOT_TOKEN);
