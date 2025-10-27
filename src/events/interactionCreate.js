const { Events, Collection, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        const isOnCooldown = await cooldownCheck(interaction, command);
        if (isOnCooldown) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    flags: MessageFlags.Ephemeral,
                });
            }
        }

        // console.log(interaction);
    }
}

const cooldownCheck = async (interaction, command) => {
    const { cooldowns } = interaction.client;

    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const expirationTimestamp = Math.round(expirationTime / 1_000);
            await interaction.reply({
                content: `Зачекайте будь ласка, ви не можете викликати команду '${command.data.name}'. Ви зможете викликати її через <t:${expirationTimestamp}:R>.`,
                flags: MessageFlags.Ephemeral,
            });
            return true;
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    return false;
}