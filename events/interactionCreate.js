const { Events } = require('discord.js');
const handleLoginButton = require('./buttons/loginButton');
const handleViewCartButton = require('./buttons/viewCartButton');
const handleViewCategoriesButton = require('./buttons/viewCategoriesButton');
const { generatePageContent } = require('./buttons/viewCategoriesButton');
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
                } else if (interaction.customId.startsWith('package_')) {
                    await require('./buttons/packageButton')(interaction, client);
                } else if (interaction.customId === 'previous_page' || interaction.customId === 'next_page') {
                    await interaction.deferUpdate(); // Defer to avoid timing out
                
                    const isNext = interaction.customId === 'next_page';
                    const categoriesPerPage = 10;
                    const totalPages = Math.ceil(client.cachedCategories.length / categoriesPerPage);
                
                    client.currentPage += isNext ? 1 : -1;
                
                    if (client.currentPage < 0) client.currentPage = 0;
                    if (client.currentPage >= totalPages) client.currentPage = totalPages - 1;
                
                    const { embed, actionRows } = generatePageContent(client.cachedCategories, client.currentPage);
                
                    await interaction.editReply({
                        embeds: [embed],
                        components: actionRows,
                    });
                }                
            } else if (interaction.isModalSubmit()) {
                if (interaction.customId === 'login_modal') {
                    await handleLoginModal(interaction, client);
                }
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({
                    content: 'An error occurred while processing your interaction.',
                });
            } else {
                await interaction.reply({
                    content: 'An error occurred while processing your interaction.',
                    ephemeral: true,
                });
            }
        }
    },
};
