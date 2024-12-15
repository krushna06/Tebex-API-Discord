const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { createBasket } = require('../apiHandlers/loginHandler');
const { saveUser } = require('../utility/databaseHandler');
const { getBasketDetails } = require('../apiHandlers/packageHandler');
const { getMinecraftUsername } = require('../utility/databaseHandler');
const { fetchMinecraftProfile } = require('../apiHandlers/profileHandler');
const { fetchCategoriesWithPackages } = require('../apiHandlers/viewHandler');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'There was an error executing that command!',
                    ephemeral: true,
                });
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'login_button') {
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
            } else if (interaction.customId === 'view_cart_button') {
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
            } else if (interaction.customId === 'view_categories_button') {
                try {
                    const categories = await fetchCategoriesWithPackages();

                    if (!categories.length) {
                        return interaction.reply({
                            content: 'No categories are currently available.',
                            ephemeral: true,
                        });
                    }

                    const embed = new EmbedBuilder()
                        .setTitle('Available Categories')
                        .setColor(0x00FF00)
                        .setDescription(
                            categories
                                .map((category, index) => `${index + 1} - **${category.name}**`)
                                .join('\n')
                        )
                        .setFooter({
                            text: 'Click a button below to view packages in the corresponding category.',
                        });

                    const actionRow = new ActionRowBuilder();
                    categories.forEach((category, index) => {
                        actionRow.addComponents(
                            new ButtonBuilder()
                                .setCustomId(`category_${index}`)
                                .setLabel(`${index + 1}`)
                                .setStyle(ButtonStyle.Primary)
                        );
                    });

                    await interaction.reply({
                        embeds: [embed],
                        components: [actionRow],
                        ephemeral: true,
                    });

                    client.cachedCategories = categories;
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    await interaction.reply({
                        content: 'An error occurred while fetching category information.',
                        ephemeral: true,
                    });
                }
            } else if (interaction.customId.startsWith('category_')) {
                const categoryIndex = parseInt(interaction.customId.split('_')[1], 10);
                const category = client.cachedCategories[categoryIndex];

                if (!category) {
                    return interaction.reply({
                        content: 'Category not found. Please try again.',
                        ephemeral: true,
                    });
                }

                if (!category.packages || category.packages.length === 0) {
                    return interaction.reply({
                        content: `No packages are available in the "${category.name}" category.`,
                        ephemeral: true,
                    });
                }

                const embed = new EmbedBuilder()
                    .setTitle(`Packages in "${category.name}"`)
                    .setColor(0x00A2E8)
                    .setDescription(
                        category.packages
                            .map(
                                (pkg) => `- **${pkg.name}**: $${pkg.total_price.toFixed(2)} ${pkg.currency}`
                            )
                            .join('\n')
                    )
                    .setFooter({
                        text: 'Use /addpackage to add items to your basket!',
                    });

                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
            }
        } else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'login_modal') {
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
            }
        }
    },
};
