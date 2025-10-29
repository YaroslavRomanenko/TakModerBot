const { SlashCommandBuilder, EmbedBuilder, MessageFlags, TextDisplayBuilder, SeparatorBuilder, SectionBuilder, ThumbnailBuilder, SeparatorSpacingSize, ComponentBuilder, ContainerBuilder, RoleFlags} = require('discord.js');

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

            return interaction.reply({ content: 'Користувача не знайдено!\nМожливо ви вказали не правильне id, або дані про цього користувача не містяться в базі даних.', flags: MessageFlags.Ephemeral});
        }
        console.log(userData);
        console.log(userData.id);

        let user;
        try {
            user = await interaction.client.users.fetch(userId);
        } catch (error) {
            console.error(`User was not found during get_user_info command. Reason: ${error.message}`);

            return interaction.reply({ content: 'Користувача не знайдено! Можливо користувач став недійсним.', flags: MessageFlags.Ephemeral });
        }

        console.log(user);

        const components = await displayInfoEmbedded(user, userData);
        console.log(components);
        return interaction.reply({ components: [components], flags: MessageFlags.IsComponentsV2 });
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

const displayInfoEmbedded = async (user, userData) => {
    let heading = '# Інформація';

    const userInfo = `- **Id:** ${user.id}\n` +
                     `- **Профіль:** <@${user.id}>\n` +
                     `- **Nickname:** ${user.globalName}\n` +
                     `- **Username:** ${user.username}\n` +
                     `- **Вік:** ${userData.age.toString()}\n` +
                     `- **Область або місто проживання:** ${userData.oblastOrCity}\n` +
                     `- **Звідки дізнався/дізналася про сервер:** ${userData.whereFoundServer}\n` +
                     `- **Чи знає правила:** ${userData.doKnowRules ? 'Так' : 'Ні'}\n` +
                     `- **Чи бував/бувала на подібних серверах:** ${userData.haveBeenOnSimilarServers ? 'Так' : 'Ні'}`

    const userBannerURL = user.banner ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.gif?size=512` : null;

    const container = new ContainerBuilder().setAccentColor(user.accentColor ?? 0xffffff)

    if (userBannerURL) {
        container.addMediaGalleryComponents((media) => media.addItems((item) => item.setURL(userBannerURL)));
        container.addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
    }
    else heading += '\n#'

    container
        .addSectionComponents(section => {
            return section
                .addTextDisplayComponents((textDisplay) => textDisplay.setContent(`${heading} про користувача`))
                .setThumbnailAccessory((thumbnail) => thumbnail.setURL(user.displayAvatarURL()))
            })
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((textDisplay) => textDisplay.setContent(userInfo))

    return container;
}