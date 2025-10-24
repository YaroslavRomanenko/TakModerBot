const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder().setName('user').setDescription('Provides information about the user'),
    async execute(interaction) {
        const username = await userInfo();
        await interaction.reply(
            `Username: ${username}`,
        );
    },
}

const userId = '1094957058706644992';

const url = `http://localhost:8080/api/username/${userId}`;
const testUrl = 'http://localhost:8080/api/test'

const getRequest = new Request(url, {
   method: "GET" 
});

const userInfo = async () => {
    const response = await fetch(getRequest);
    const myJson = await response.json();

    console.log(myJson.username);
    return myJson.username;
}