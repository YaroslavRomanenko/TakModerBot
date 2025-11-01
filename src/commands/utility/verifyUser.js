const { SlashCommandBuilder, ContainerBuilder, MessageFlags, ButtonStyle, ComponentType, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, LabelBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test_command')
        .setDescription('Команда в розробці'),
    async execute(interaction) {
        let verificationData = {
            id: null,
            age: null,
            oblastOrCity: null,
            whereFoundServer: null,
            doKnowRules: null,
            haveBeenOnSimilarServers: null
        }

        const fieldLabels = {
            id: 'Id',
            age: 'Вік',
            oblastOrCity: 'Область або місто',
            whereFoundServer: 'Звідки дізнався/дізналася про сервер',
            doKnowRules: 'Чи знає правила',
            haveBeenOnSimilarServers: 'Чи бував/бувала на подібних серверах'
        }

        let container = displayInfoEmbedded(interaction, verificationData);
        const response = await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });

        const filter = (i) => i.user.id === interaction.user.id;

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: filter,
            time: 600_000
        });

        collector.on('collect', async (buttonInteraction) => {
            const buttonId = buttonInteraction.customId;
            const fieldToEdit = buttonId.replace('_button', '');

            if (buttonId.endsWith('_button') && fieldToEdit !== 'submit' && fieldToEdit !== 'cancel') {
                try {
                    let modal;
                    if (fieldToEdit === 'doKnowRules' || fieldToEdit === 'haveBeenOnSimilarServers') {
                        modal = await createModalBoolean(fieldToEdit, fieldLabels[fieldToEdit]);
                    } else {
                        modal = await createModalInput(fieldToEdit, fieldLabels[fieldToEdit]);
                    }
                    await buttonInteraction.showModal(modal);

                    const modalSubmit = await buttonInteraction.awaitModalSubmit({ time: 60_000 })

                    let submittedValue;
                    if (fieldToEdit === 'doKnowRules' || fieldToEdit === 'haveBeenOnSimilarServers') {
                        submittedValue = modalSubmit.fields.getStringSelectValues(`${fieldToEdit}_option`)[0];
                    } else {
                        submittedValue = modalSubmit.fields.getTextInputValue(`${fieldToEdit}_input`);
                    }

                    verificationData[fieldToEdit] = submittedValue;

                    const updateContainer = displayInfoEmbedded(interaction, verificationData);
                    await modalSubmit.update({ components: [updateContainer] });
                } catch (error) {
                    console.log(`User can't send modal window. Reason: ${error.message}`);
                }
            }

            if (buttonId === 'submit_button') {
                const missingFiedls = Object.keys(verificationData).filter(key => verificationData[key] === null);

                if (missingFiedls.length > 0) {
                    const missingLabel = missingFiedls.at(0);

                    await buttonInteraction.reply({
                        content: `**Помилка!** Заповніть поле: ${missingLabel}`,
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    let user;

                    try {
                        user = await interaction.client.users.fetch(verificationData.id);
                    } catch (error) {
                        console.error(`User was not found during verify_user command. Reason: ${error.message}`);

                        await buttonInteraction.reply({ content: 'Користувача не знайдено! Можливо ви вказали не правильне id.', flags: MessageFlags.Ephemeral });
                        return;
                    }

                    verificationData.username = user.username;

                    try {
                        verificationData.doKnowRules = verificationData.doKnowRules === 'Так' ? true : false;
                        verificationData.haveBeenOnSimilarServers = verificationData.haveBeenOnSimilarServers === 'Так' ? true : false;
                        console.log(verificationData);
                        await addUser(verificationData);
                    } catch(error) {
                        console.log(`Can't add user: ${userData.id} via api during verify_user command. Reason: ${error.message}`);
            
                        return interaction.reply({ content: `Не вдалося додати користувача **${user.globalName}**. Можливі проблеми з сервером`, flags: MessageFlags.Ephemeral });
                    }

                    const cancelContainer = new ContainerBuilder()
                        .addTextDisplayComponents((text) => text.setContent(`Користувач **${user.globalName}** успішно доданий!`));
                    await buttonInteraction.update({
                        components: [cancelContainer]
                    });
                    collector.stop();
                }
            }

            if (buttonId === 'cancel_button') {
                const cancelContainer = new ContainerBuilder()
                    .addTextDisplayComponents((text) => text.setContent('Верифікацію скасовано.'));
                await buttonInteraction.update({
                    components: [cancelContainer]
                });
                collector.stop();
            }
        })
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

const displayInfoEmbedded = (interaction, data = {}) => {
    const names = ['Id', 'Age', '']
    const placeholder = 'Не вказано';
    const container = new ContainerBuilder().setAccentColor(interaction.user.accentColor ?? 0xffffff);

    const createSection = (property, content) => {
        const currentValue = data[property] || placeholder;
        container.addSectionComponents((section) => 
        section
            .addTextDisplayComponents((textDisplay) => textDisplay.setContent(`**${content}:** ${currentValue}`))
            .setButtonAccessory((button) => button.setCustomId(`${property}_button`).setEmoji( { name: '✏️' }).setStyle(ButtonStyle.Secondary))
        )
    }

    container.addTextDisplayComponents((textDisplay) => textDisplay.setContent('# Верифікація користувача'));
    container.addSeparatorComponents((separator) => separator.setDivider(true));
    createSection('id', 'Id');
    createSection('age', 'Вік');
    createSection('oblastOrCity', 'Область або місто проживання');
    createSection('whereFoundServer', 'Звідки дізнався/дізналася про сервер');
    createSection('doKnowRules', 'Чи знає правила');
    createSection('haveBeenOnSimilarServers', 'Чи бував/бувала на подібних серверах');
    
    const sumbitButton = new ButtonBuilder().setCustomId('submit_button').setLabel('Відправити').setStyle(ButtonStyle.Primary);
    const cancelButton = new ButtonBuilder().setCustomId('cancel_button').setLabel('Скасувати').setStyle(ButtonStyle.Secondary);
    const buttonsInRow = new ActionRowBuilder().setComponents(cancelButton, sumbitButton);

    container.addActionRowComponents(buttonsInRow);

    return container
}

const createModalInput = async (property, description) => {
    const modal = new ModalBuilder()
        .setCustomId(`${property}_modal`)
        .setTitle('Верифікація користувача')

    const nameInput = new TextInputBuilder()
        .setCustomId(`${property}_input`)
        .setLabel(`Введіть ${description}`)
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(nameInput);

    modal.addComponents(actionRow);

    return modal;
}

const createModalBoolean = async (property, description) => {
    const modal = new ModalBuilder()
        .setCustomId(`${property}_modal`)
        .setTitle('Верифікація користувача')

    const booleanSelect = new LabelBuilder()
        .setLabel(`Оберіть ${description}`)
        .setStringSelectMenuComponent(
            new StringSelectMenuBuilder()
                .setCustomId(`${property}_option`)
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Так')
                        .setValue('Так'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Ні')
                        .setValue('Ні')
                )
                .setRequired(true)
        )

    modal.addLabelComponents(booleanSelect);

    return modal;
}