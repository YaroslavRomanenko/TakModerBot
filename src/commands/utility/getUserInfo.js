const { SlashCommandBuilder, EmbedBuilder, MessageFlags, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_user_info')
        .setDescription('Виводить інформацію про вказаного користувача')
        .addStringOption((option) => option.setName('id').setDescription('Ідентифікатор користувача').setRequired(true)),
    async execute(interaction) {
        const userId = interaction.options.getString('id');

        let userData;
        try {
            userData = await getUserInfo(userId);
        } catch(error) {
            console.log(`Can't retrieve userData during get_user_info command. Reason: ${error.message}`)

            return interaction.reply('Користувача не знайдено!\n Можливо ви вказали не правильне id, або дані про цього користувача не містяться в базі даних.');
        }
        console.log(userData);
        console.log(userData.id);

        let user;
        try {
            user = await interaction.client.users.fetch(userId);
        } catch (error) {
            console.error(`User was not found during get_user_info command. Reason: ${error.message}`);

            return interaction.reply('Користувача не знайдено! Можливо користувач став недійсним.');
        }

        console.log(user);

        const textComponent = new TextDisplayBuilder()
            .setContent(`# Інформація про користувача
                         - **Id:** ${user.id}
                         - **Nickname:** ${user.globalName}
                         - **Username:** ${user.username}
                         - **Вік:** ${userData.age.toString()}
                         - **Область або місто проживання:** ${userData.oblastOrCity}
                         - **Звідки дізнався/дізналася про сервер:** ${userData.whereFoundServer}
                         - **Чи знає правила:** ${userData.doKnowRules ? 'Так' : 'Ні'}
                         - **Чи бував/бувала на подібних серверах:** ${userData.haveBeenOnSimilarServers ? 'Так' : 'Ні'}`)

        const thumbnailComponent = new ThumbnailBuilder().setURL(user.avatarURL());

        const sectionComponent = new SectionBuilder()
            .addTextDisplayComponents(textComponent)
            .setThumbnailAccessory(thumbnailComponent)

        return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [sectionComponent] });
    },
}

const getUserInfo = async (userId) => {
    const url = `http://localhost:8080/api/user/${userId}`;

    const getRequest = new Request(url, {
        method: "GET" 
    });

    const response = await fetch(getRequest);
    const myJson = await response.json();

    console.log(myJson.username);
    return myJson;
}