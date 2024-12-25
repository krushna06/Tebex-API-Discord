const { addPackageToBasket } = require('../../apiHandlers/packageHandler');
const { getMinecraftUsername } = require('../../utility/databaseHandler');

module.exports = async (interaction, client) => {
    try {
        const packageId = parseInt(interaction.customId.split('_')[3], 10);
        const discordUserId = interaction.user.id;

        const db = client.db;
        const minecraftUsername = await getMinecraftUsername(db, discordUserId);

        if (!minecraftUsername) {
            return interaction.reply({
                content: 'Your username is not linked. Please use /login first.',
                ephemeral: true,
            });
        }

        const row = await new Promise((resolve, reject) => {
            db.get(
                `SELECT basket_ident FROM users WHERE discord_user_id = ?`,
                [discordUserId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!row || !row.basket_ident) {
            return interaction.reply({
                content: 'No basket found for your account. Please link your account first.',
                ephemeral: true,
            });
        }

        const basketIdent = row.basket_ident;
        const result = await addPackageToBasket(basketIdent, packageId, 1);

        const checkoutUrl = result.links.checkout;
        await interaction.reply({
            content: `Package added successfully! [Checkout your basket here](${checkoutUrl})`,
            ephemeral: true,
        });
    } catch (error) {
        console.error('Error handling Add to Cart button interaction:', error);
        await interaction.reply({
            content: 'An error occurred while adding the package to your cart.',
            ephemeral: true,
        });
    }
};
