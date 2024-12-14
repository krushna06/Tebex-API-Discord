module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);

            if (interaction.commandName === 'login') {
                client.userLoginTimestamps.set(interaction.user.id, Date.now());
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error executing that command!',
                ephemeral: true,
            });
        }
    },
};
