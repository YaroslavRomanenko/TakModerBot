const { Events } = require('discord.js')

module.exports = {
    name: Events.GuildMemberAdd,
    execute(member) {
        console.log(`New member ${member.user.globalName} has joined!`);
        member.send('# Вітаємо на сервері Tak!!!');
    },
};

