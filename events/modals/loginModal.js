const { createBasket } = require('../../apiHandlers/loginHandler');
const { saveUser } = require('../../utility/databaseHandler');

module.exports = async (interaction, client) => {
    const username = interaction.fields.getTextInputValue('username_input');
    const discordUserId = interaction.user.id;

    try {
        const basketIdent = await createBasket(username);

        if (basketIdent) {
            await saveUser(client.db, discordUserId, username, basketIdent);

            await interaction.reply({
                content: `Username linked successfully! Basket ID: ${basketIdent}`,
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: 'Failed to fetch data from the API.',
                ephemeral: true,
            });
        }
    } catch (error) {
        console.error('Error processing login modal:', error);
        await interaction.reply({
            content: 'An error occurred while processing your request.',
            ephemeral: true,
        });
    }
};
