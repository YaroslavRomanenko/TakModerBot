const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify_user')
        .setDescription('Save data about users')
        .addStringOption((option) => option.setName('id').setDescription('Ідентифікатор користувача').setRequired(true))
        .addIntegerOption((option) => option.setName('age').setDescription('Кількість років').setRequired(true))
        .addStringOption((option) => option.setName('oblast_or_city').setDescription('Область або місто проживання').setRequired(true))
        .addStringOption((option) => option.setName('where_found_server').setDescription('Звідки дізнався/дізналася про сервер').setRequired(true))
        .addBooleanOption((option) => option.setName('do_know_rules').setDescription('Чи знає правила').setRequired(true))
        .addBooleanOption((option) => option.setName('have_been_on_similar_servers').setDescription('Чи бував/бувала на подібних серверах').setRequired(true)),
    async execute(interaction) {
        const userId = interaction.options.getString('id');

        let user;
        try {
            user = await interaction.client.users.fetch(userId);
        } catch (error) {
            console.error(`User was not found during verify_user command. Reason: ${error.message}`);

            return interaction.reply('Користувача не знайдено! Можливо ви вказали не правильне id.');
        }

        const userData = {
            id: user.id,
            username: user.username,
            age: interaction.options.getInteger('age'),
            oblastOrCity: interaction.options.getString('oblast_or_city'),
            whereFoundServer: interaction.options.getString('where_found_server'),
            doKnowRules: interaction.options.getBoolean('do_know_rules'),
            haveBeenOnSimilarServers: interaction.options.getBoolean('have_been_on_similar_servers'),
        }

        console.log(userData);

        try {
            await addUser(userData)
            return interaction.reply('Користувач успішно доданий!')
        } catch(error) {
            console.log(`Can't add user: ${userData.id} via api during verify_user command. Reason: ${error.message}`);

            return interaction.reply('Не вдалося додати користувача. Можливі проблеми з сервером')
        }
    },

};

const addUser = async (userData) => {
    const url = `http://localhost:8080/api/user/addUser`;

    const postRequest = new Request(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify(userData)
    });

    const response = await fetch(postRequest);
    console.log(`Status code: ${response.status}`)

    return true;
}