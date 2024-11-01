import { Events } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
            }
        } 

        else if (interaction.isModalSubmit()) {
            const modalsPath = path.join(__dirname, 'modals');
            const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));

            for (const file of modalFiles) {
                const modal = await import(path.join(modalsPath, file));
                if (modal.default.customId === interaction.customId) {
                    try {
                        await modal.default.execute(interaction);
                    } catch (error) {
                        console.error(error);
                        await interaction.reply({ content: 'There was an error handling this modal.', ephemeral: true });
                    }
                    break;
                }
            }
        }
    }
};
