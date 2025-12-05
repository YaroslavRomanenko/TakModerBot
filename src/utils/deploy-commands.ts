import { REST, Routes } from "discord.js";
import 'dotenv/config';
import { commands } from '../commands/index.js';

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const commandsData = commands.map((commands) => commands.data.toJSON());

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commandsData.length} command`)

    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commandsData }
    );

    console.log(`Commands is successfully updated!`);
  } catch (error) {
    console.error(`Error has occurred during updating commands!`, error);
  }
})();
