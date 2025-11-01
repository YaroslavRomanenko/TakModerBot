const { SlashCommandBuilder, MessageFlags, AttachmentBuilder } = require('discord.js')
const Canvas = require('@napi-rs/canvas');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('draw_canvas')
        .setDescription('Малює полотно'),
    async execute(interaction) {
        const canvas = Canvas.createCanvas(700, 250);
        const context = canvas.getContext('2d');
        
        const backgroundPath = path.join(__dirname, '../../../res/SAO.jpg');
        const background = await Canvas.loadImage(backgroundPath);
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        context.font = '50px sans-serif';
        context.fillStyle = '#ffffff';
        context.fillText(interaction.user.globalName, canvas.width / 2.6, canvas.height / 2.2);

        context.beginPath();
        context.arc(125, 125, 100, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        const avatar = await Canvas.loadImage(interaction.user.displayAvatarURL({ extension: 'jpg' }));

        context.drawImage(avatar, 25, 25, 200, 200);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), {name: 'profile-image.png' });

        return interaction.reply({ files: [attachment] });
    },
};