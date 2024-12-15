const { Events } = require('discord.js');
const handleLoginButton = require('./buttons/loginButton');
const handleViewCartButton = require('./buttons/viewCartButton');
const handleViewCategoriesButton = require('./buttons/viewCategoriesButton');
const handleLoginModal = require('./modals/loginModal');
const handleCategoryButton = require('./buttons/categoryButton');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        try {
            if (interaction.isCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;
                await command.execute(interaction, client);
            } else if (interaction.isButton()) {
                if (interaction.customId === 'login_button') {
                    await handleLoginButton(interaction);
                } else if (interaction.customId === 'view_cart_button') {
                    await handleViewCartButton(interaction, client);
                } else if (interaction.customId === 'view_categories_button') {
                    await handleViewCategoriesButton(interaction, client);
                } else if (interaction.customId.startsWith('category_')) {
                    await handleCategoryButton(interaction, client);
                }
            } else if (interaction.isModalSubmit()) {
                if (interaction.customId === 'login_modal') {
                    await handleLoginModal(interaction, client);
                }
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            await interaction.reply({
                content: 'An error occurred while processing your interaction.',
                ephemeral: true,
            });
        }
    },
};
