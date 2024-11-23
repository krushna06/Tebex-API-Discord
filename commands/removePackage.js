const { SlashCommandBuilder } = require('discord.js');
const { removePackageFromBasket } = require('../apiHandlers/packageHandler');
const { getMinecraftUsername } = require('../utility/databaseHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removepackage')
        .setDescription('Remove a package from your basket.')
        .addIntegerOption(option =>
            option.setName('package_id')
                .setDescription('The ID of the package to remove')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const packageId = interaction.options.getInteger('package_id');
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

            const result = await removePackageFromBasket(basketIdent, packageId);

            interaction.editReply(`Package with ID ${packageId} removed successfully!`);
        } catch (error) {
            console.error('Error executing /removepackage command:', error);
            interaction.editReply('An error occurred while processing your request.');
        }
    },
};
