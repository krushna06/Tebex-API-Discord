import { Events } from 'discord.js';
import { handleInteraction } from '../handlers/interactionHandler.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        await handleInteraction(interaction.client, interaction);
    }
};
