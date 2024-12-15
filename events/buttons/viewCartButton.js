const { EmbedBuilder } = require('discord.js');
const { getMinecraftUsername } = require('../../utility/databaseHandler');
const { getBasketDetails } = require('../../apiHandlers/packageHandler');
const { fetchMinecraftProfile } = require('../../apiHandlers/profileHandler');

module.exports = async (interaction, client) => {
    const discordUserId = interaction.user.id;

    try {
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
                (err, row) => (err ? reject(err) : resolve(row))
            );
        });

        if (!row || !row.basket_ident) {
            return interaction.reply({
                content: 'No basket found for your account. Please link your account first.',
                ephemeral: true,
            });
        }

        const basketIdent = row.basket_ident;
        const basketDetails = await getBasketDetails(basketIdent);
        const totalPrice = basketDetails.total_price;
        const packages = basketDetails.packages.map(
            (pkg) => `${pkg.name} (x${pkg.in_basket.quantity})`
        ).join('\n');
        const { profilePictureUrl } = await fetchMinecraftProfile(minecraftUsername);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Your Tebex Basket')
            .setThumbnail(profilePictureUrl)
            .addFields(
                { name: 'Username', value: minecraftUsername, inline: true },
                { name: 'Total Price', value: `$${totalPrice.toFixed(2)}`, inline: true },
                { name: 'Packages in Basket', value: packages || 'No packages in the basket.', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Tebex Cart' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error('Error fetching basket details:', error);
        await interaction.reply({
            content: 'An error occurred while fetching your basket details.',
            ephemeral: true,
        });
    }
};
