require('dotenv').config();
const { Telegraf } = require('telegraf');
const schedule = require('node-schedule');
const { getWeatherForNow, getWeatherForToday} = require('./functions');

const bot = new Telegraf(process.env.BOT_TOKEN);

// start command
bot.start((ctx) => {
  return ctx.reply(`Добро пожаловать в Weather-Today! 
Город по умолчанию - Москва 
/help для справки`); 
});

// help with all commands
bot.help((ctx) => {
  return ctx.reply(`/start - О боте
/today (city) - для получения информации о погоде на текущий день (параметр city опционален, название города вводится по-английски)
/now (city) - для получения прогноза на текущий момент (параметр city опционален, название города вводится по-английски)
/schedule - для получения прогноза по расписанию
/stopschedule - остановить уведомления по расписанию`);
}); 

// command /today, can accept city as param via space
// only eng city names currently
bot.command('today', async (ctx) => {
  const [, param] = ctx.message.text.split(' ');
  if (!param) {
    ctx.reply(await getWeatherForToday());
  } else {
    ctx.reply(await getWeatherForToday(param));
  }
});

// command /now, can accept city as param via space
// only eng city names currently
bot.command('now', async (ctx) => {
  const [, param] = ctx.message.text.split(' ');
  if (!param) {
    ctx.reply(await getWeatherForNow());
  } else {
    ctx.reply(await getWeatherForNow(param));
  }
});

// weather schedule
// '30 7 * * *' - cron param for setting schedule at 7:30 every day

let job; 

// command /schedule - starts schedule
bot.command('schedule', (ctx) => {
  job = schedule.scheduleJob('*/1 * * * *', async () => {
    bot.telegram.sendMessage(ctx.chat.id, await getWeatherForToday());
  });
});

// command /stopschedule - stops current schedule
bot.command('stopschedule', (ctx) => {
    if (job) {
        job.cancel()
    }
});

// bots replies with this message if it hadn't been triggered with any of the previous handlers
bot.on('message', (ctx) => ctx.reply('Введите команду. Список команд /help'));

// bot launch
bot.launch();
console.log('Bot is up!');
