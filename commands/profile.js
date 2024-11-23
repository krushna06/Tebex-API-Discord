const { SlashCommandBuilder } = require('discord.js');
const { getMinecraftUsername } = require('../utility/databaseHandler');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your or another user\'s Minecraft profile.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Minecraft username (leave blank to use your linked Minecraft username)')
                .setRequired(false)
        ),
    async execute(interaction) {
        const discordUserId = interaction.user.id;
        let minecraftUsername = interaction.options.getString('username');

        try {
            if (!minecraftUsername) {
                minecraftUsername = await getMinecraftUsername(interaction.client.db, discordUserId);
            }

            if (!minecraftUsername) {
                return interaction.reply({ content: 'You need to link your Minecraft account using /login first.', ephemeral: true });
            }

            const userData = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${minecraftUsername}`);
            
            if (userData.data) {
                const uuid = userData.data.id;
                const profilePictureUrl = `https://mc-heads.net/avatar/${uuid}`;
                
                const profileEmbed = {
                    color: 0x00FF00,
                    title: `${minecraftUsername}'s Minecraft Profile`,
                    thumbnail: {
                        url: profilePictureUrl,
                    },
                    fields: [
                        {
                            name: 'Minecraft UUID',
                            value: uuid,
                            inline: true,
                        },
                        {
                            name: 'Profile Picture',
                            value: `[Click to view](${profilePictureUrl})`,
                            inline: true,
                        },
                    ],
                    footer: {
                        text: 'Minecraft Profile Information',
                    },
                };

                await interaction.reply({ embeds: [profileEmbed] });
            } else {
                await interaction.reply({ content: 'Minecraft username not found. Please ensure your account is linked with /login.', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while fetching the Minecraft profile. Please try again later.', ephemeral: true });
        }
    },
};
