import { MessageFlags, SlashCommandBuilder } from 'discord.js'
import { type Command } from '../types/types.js'
import { AppDataSource } from '../database/data-source.js';
import { User } from '../database/entities/user.js';

export const VerifyUserCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('verify-user')
    .setDescription('Save data about users')
    .addStringOption((option) => option.setName('id').setDescription('Ідентифікатор користувача').setRequired(true))
    .addIntegerOption((option) => option.setName('age').setDescription('Кількість років').setRequired(true))
    .addStringOption((option) => option.setName('oblast-or-city').setDescription('Область, або місто проживання').setRequired(true))
    .addStringOption((option) => option.setName('where-found-server').setDescription('Звідки дізнався/дізналася про сервер').setRequired(true))
    .addBooleanOption((option) => option.setName('have-been-on-similar-servers').setDescription('Чи бував/бувала на подібних серверах').setRequired(true)),

  execute: async (interaction) => {
    const userRepo = AppDataSource.getRepository(User);

    const userId = interaction.options.getString('id', true);
    const age = interaction.options.getInteger('age', true);
    const oblastOrCity = interaction.options.getString('oblast-or-city', true);
    const whereFoundServer = interaction.options.getString('where-found-server', true);
    const haveBeenOnSimilarServers = interaction.options.getBoolean('have-been-on-similar-servers', true);

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
        user = userRepo.create({ id: userId });
        console.log(`Creating new user ${userId}`);
      } else {
        console.log(`[WARNING] User already exist in db!`);
        await interaction.reply({
          content: `Користувач ${userDiscord.globalName} вже знаходиться в базі даних`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      user.age = age;
      user.oblastOrCity = oblastOrCity;
      user.whereFoundServer = whereFoundServer;
      user.haveBeenOnSimilarServers = haveBeenOnSimilarServers;
      user.username = userDiscord.username;
      user.global_name = userDiscord.globalName;
      user.avatar = userDiscord.avatar;
      user.banner = userDiscord.banner ?? null;
      user.accent_color = userDiscord.accentColor ?? null;

      await userRepo.save(user);

      await interaction.reply({ 
        content: `Користувача: **${userDiscord.globalName}** успішно збережено! ID користувача: **${userId}**`,
        flags: MessageFlags.Ephemeral,
      });

    } catch (error) {
      console.error('[ERROR] Error during recording to db in verify-user', error);
      await interaction.reply({
        content: `Сталася помилка при збережені даних.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}