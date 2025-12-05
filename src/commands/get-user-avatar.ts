import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/types.js";

export const GetUserAvatar: Command = {
  data: new SlashCommandBuilder()
    .setName('get-user-avatar')
    .setDescription('Виводить аватарку зазначеного користувача')
    .addStringOption((option) => option.setName('id').setDescription('Ідентифікатор користувача').setRequired(true))
    .addIntegerOption((option) => option.setName('size').setDescription('Розмір аватарки')
      .addChoices(
        { name: '256', value: 256 },
        { name: '128', value: 128 },
        { name: '64', value: 64 },
        { name: '32', value: 32 },
        { name: '16', value: 16 },
      )
    ),

  execute: async(interaction) => {
    const userId = interaction.options.getString('id', true);
    const size = interaction.options.getInteger('size') ?? 256;

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

    const userAvatar = userDiscord.avatarURL({ size }) ?? userDiscord.defaultAvatarURL;

    await interaction.reply(userAvatar);
  }
}