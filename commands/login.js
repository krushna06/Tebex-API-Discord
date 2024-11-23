const { SlashCommandBuilder } = require('discord.js');
const { createBasket } = require('../apiHandlers/loginHandler');
const { saveUser } = require('../utility/databaseHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Link your Minecraft username with your Discord account.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Your Minecraft username')
                .setRequired(true)
        ),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const discordUserId = interaction.user.id;

        try {
            const basketIdent = await createBasket(username);

            if (basketIdent) {
                await saveUser(interaction.client.db, discordUserId, username, basketIdent);

                interaction.reply({ content: `Username linked! Basket ID: ${basketIdent}`, ephemeral: true });
            } else {
                interaction.reply({ content: 'Failed to fetch data from the API.', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
        }
    }
};
