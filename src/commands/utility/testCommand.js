const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test_command')
        .setDescription('Команда в розробці'),
    async execute(interaction) {
        return interaction.reply('Поки що немає команд на тестувані((');
    }
};