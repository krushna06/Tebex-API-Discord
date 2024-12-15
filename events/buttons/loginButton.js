const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = async (interaction) => {
    const modal = new ModalBuilder()
        .setCustomId('login_modal')
        .setTitle('Login to Minecraft');

    const usernameInput = new TextInputBuilder()
        .setCustomId('username_input')
        .setLabel('Enter your Minecraft username:')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(usernameInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
};
