const { SlashCommandBuilder } = require('discord.js');
const { addPackageToBasket } = require('../apiHandlers/packageHandler');
const { getMinecraftUsername } = require('../utility/databaseHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addpackage')
        .setDescription('Add a package to your basket.')
        .addIntegerOption(option =>
            option.setName('package_id')
                .setDescription('The ID of the package to add')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('quantity')
                .setDescription('The quantity of the package to add')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const packageId = interaction.options.getInteger('package_id');
        const quantity = interaction.options.getInteger('quantity');
        const discordUserId = interaction.user.id;

        try {
            const db = interaction.client.db;
            const minecraftUsername = await getMinecraftUsername(db, discordUserId);

            if (!minecraftUsername) {
                return interaction.editReply('Your username is not linked. Please use /login first.');
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
                return interaction.editReply('No basket found for your account. Please link your account first.');
            }

            const basketIdent = row.basket_ident;

            const result = await addPackageToBasket(basketIdent, packageId, quantity);

            const checkoutUrl = result.links.checkout;
            interaction.editReply(`Package added successfully! [Checkout your basket here](${checkoutUrl})`);
        } catch (error) {
            console.error('Error executing /addpackage command:', error);
            interaction.editReply('An error occurred while processing your request.');
        }
    },
};
