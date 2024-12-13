const { SlashCommandBuilder } = require('discord.js');
const { applyCreatorCode } = require('../apiHandlers/creatorCodeHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply-creator-code')
        .setDescription('Apply a creator code to your basket.')
        .addStringOption(option =>
            option
                .setName('code')
                .setDescription('The creator code to apply')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const discordUserId = interaction.user.id;
        const creatorCode = interaction.options.getString('code');
        const token = process.env.TEBEX_API_KEY;

        try {
            const db = interaction.client.db;

            const result = await applyCreatorCode({ discordUserId, creatorCode, db, token, interaction });

            interaction.editReply(`Successfully applied creator code: ${creatorCode}.`);
        } catch (error) {
            console.error('Error executing /apply-creator-code command:', error);
            interaction.editReply(error.message);
        }
    },
};
