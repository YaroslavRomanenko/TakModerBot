import 'reflect-metadata';
import { Client, Events, GatewayIntentBits } from "discord.js";
import { commands } from "./commands/index.js";
import 'dotenv/config';
import { AppDataSource } from './database/data-source.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, (client) => {
  console.log('Bot is ready to work!');
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.find((cmd) => cmd.data.name === interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
  }
})

const bootstrap = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database is connected!');

    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to start discord bot(`, error.message);
    } else {
      console.error('Failed to start discord bot(', error);
    }
  }
};

bootstrap();