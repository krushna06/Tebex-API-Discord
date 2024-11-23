const { SlashCommandBuilder } = require('discord.js');
const { getMinecraftUsername } = require('../utility/databaseHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkout')
        .setDescription('Get the checkout link for your basket.'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

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
            const checkoutLink = `https://pay.tebex.io/${basketIdent}`;

            interaction.editReply({
                content: `Here is your checkout link for your cart: [Checkout Link](${checkoutLink})`
            });
        } catch (error) {
            console.error('Error executing /checkout command:', error);
            interaction.editReply('An error occurred while processing your request.');
        }
    },
};
