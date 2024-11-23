const axios = require('axios');

async function fetchMinecraftProfile(minecraftUsername) {
    try {
        const userData = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${minecraftUsername}`);
        
        if (userData.data) {
            const uuid = userData.data.id;
            const profilePictureUrl = `https://mc-heads.net/avatar/${uuid}`;
            return { uuid, profilePictureUrl };
        } else {
            throw new Error('Minecraft username not found.');
        }
    } catch (error) {
        throw new Error('An error occurred while fetching the Minecraft profile data.');
    }
}

module.exports = { fetchMinecraftProfile };
