import { ContainerBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder, User } from "discord.js";
import type { Command } from "../types/types.js";
import { AppDataSource } from "../database/data-source.js";
import { User as UserDB } from "../database/entities/user.js";

export const GetUserInfo: Command = {
  data: new SlashCommandBuilder()
    .setName('get-user-info')
    .setDescription('Виводить інформацію про вказаного користувача')
    .addStringOption((option) => option.setName('id').setDescription('Ідентифікатор користувача').setRequired(true)),

  execute: async(interaction) => {
    const userId = interaction.options.getString('id', true);

    const userRepo = AppDataSource.getRepository(UserDB);

    let userData: UserDB | null;
    try {
      userData = await userRepo.findOneBy({ id: userId });

      if (!userData) {
        await interaction.reply({
          content: `Вказаного користувача з id: **${userId}** немає в базі даних`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    } catch (error) {
      console.error(`[ERROR] Can't get user from db`);
      await interaction.reply({
        content: 'Помилка при отриманні даних про користувача.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    let userDiscord: User;
    try {
      userDiscord = await interaction.client.users.fetch(userId, { force: true});
    } catch (error) {
      console.error(`[ERROR] User was not found in discord during get-user-info command.`);
      await interaction.reply({
        content: `Користувача не знайдено в дискорді! Можливо користувач став не дійсним.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const components = await displayInfoEmbedded(userDiscord, userData);
    await interaction.reply({
      components: [components],
      flags: MessageFlags.IsComponentsV2,
    });
    console.log(`[LOG] User ${userDiscord.globalName ?? userDiscord.username} was retrieved`);
  }
}

const displayInfoEmbedded = async (user: User, userData: UserDB) => {
  let heading = '# Інформація';

  const userInfo = `- **Id:** ${user.id}\n` +
                    `- **Профіль:** <@${user.id}>\n` +
                    `- **Nickname:** ${user.globalName ?? user.username}\n` +
                    `- **Username:** ${user.username}\n` +
                    `- **Вік:** ${userData.age.toString()}\n` +
                    `- **Область або місто проживання:** ${userData.oblastOrCity}\n` +
                    `- **Звідки дізнався/дізналася про сервер:** ${userData.whereFoundServer}\n` +
                    `- **Чи бував/бувала на подібних серверах:** ${userData.haveBeenOnSimilarServers ? 'Так' : 'Ні'}`

  const userBannerURL = user.bannerURL({ size: 512 });

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