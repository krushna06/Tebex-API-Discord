const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBasketDetails } = require('../apiHandlers/packageHandler');
const { getMinecraftUsername } = require('../utility/databaseHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewcart')
        .setDescription('View the current contents of your basket with your username and total price.'),
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

            const basketDetails = await getBasketDetails(basketIdent);

            // Extract total price and other necessary information
            const totalPrice = basketDetails.total_price;
            const packages = basketDetails.packages.map(pkg => `${pkg.name} (x${pkg.in_basket.quantity})`).join('\n');

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Your Tebex Basket')
                .addFields(
                    { name: 'Username', value: minecraftUsername, inline: true },
                    { name: 'Total Price', value: `$${totalPrice.toFixed(2)}`, inline: true },
                    { name: 'Packages in Basket', value: packages || 'No packages in the basket.', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'Tebex Cart' });

            interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing /viewcart command:', error);
            interaction.editReply('An error occurred while processing your request.');
        }
    },
};
