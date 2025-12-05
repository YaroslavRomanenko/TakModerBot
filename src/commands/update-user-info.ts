import { MessageFlags, SlashCommandBuilder } from 'discord.js'
import { type Command } from '../types/types.js'
import { AppDataSource } from '../database/data-source.js';
import { User } from '../database/entities/user.js';

export const UpdateUserInfo: Command = {
  data: new SlashCommandBuilder()
    .setName('update-user-info')
    .setDescription('Save data about users')
    .addStringOption((option) => option.setName('id').setDescription('Ідентифікатор користувача').setRequired(true))
    .addIntegerOption((option) => option.setName('age').setDescription('Кількість років'))
    .addStringOption((option) => option.setName('oblast-or-city').setDescription('Область, або місто проживання'))
    .addStringOption((option) => option.setName('where-found-server').setDescription('Звідки дізнався/дізналася про сервер'))
    .addBooleanOption((option) => option.setName('have-been-on-similar-servers').setDescription('Чи бував/бувала на подібних серверах')),

  execute: async (interaction) => {
    const userRepo = AppDataSource.getRepository(User);

    const userId = interaction.options.getString('id', true);
    const age = interaction.options.getInteger('age');
    const oblastOrCity = interaction.options.getString('oblast-or-city');
    const whereFoundServer = interaction.options.getString('where-found-server');
    const haveBeenOnSimilarServers = interaction.options.getBoolean('have-been-on-similar-servers');

    if (age === null && oblastOrCity === null && whereFoundServer === null && haveBeenOnSimilarServers === null) {
      console.log(`[WARNING] User didn't specify data to update in update-user-info`);
      await interaction.reply({
        content: 'Ви не вказали, які дані потрібно оновити!',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    let userDiscord;
    try {
      userDiscord = await interaction.client.users.fetch(userId);
    } catch (error) {
      console.log(`[WARNING] User was not found in discord during verify-user command.`);
      await interaction.reply({
        content: `Користувача не знайдено в дискорді! Можливо ви вказали неправильно Id.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    try {
      let user = await userRepo.findOneBy({ id: userId });

      if (!user) {
        console.log(`[WARNING] User ${userId} not found in db during update!`);
        await interaction.reply({
          content: `Користувач ${userDiscord.globalName} вже знаходиться в базі даних`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (age !== null) user.age = age;
      if (oblastOrCity !== null) user.oblastOrCity = oblastOrCity;
      if (whereFoundServer !== null) user.whereFoundServer = whereFoundServer;
      if (haveBeenOnSimilarServers !== null) user.haveBeenOnSimilarServers = haveBeenOnSimilarServers;

      await userRepo.save(user);

      await interaction.reply({ 
        content: `Користувача: **${userDiscord.globalName ?? userDiscord.username}** успішно змінено! ID користувача: **${userId}**`,
        flags: MessageFlags.Ephemeral,
      });

    } catch (error) {
      console.error('[ERROR] Error during recording to db in update-user-info', error);
      await interaction.reply({
        content: `Сталася помилка при збережені даних.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}