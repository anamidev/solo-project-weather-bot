require('dotenv').config();
const { Telegraf } = require('telegraf');
const schedule = require('node-schedule');
const { getWeatherForNow, getWeatherForToday} = require('./functions');

const bot = new Telegraf(process.env.BOT_TOKEN); // bot name - @elbrus_weather_today_bot

// start command
bot.start((ctx) => {
  return ctx.reply(`Добро пожаловать в Weather-Today! 
Город по умолчанию - Москва
Расписание по умолчанию - каждый час
/help для справки`); 
});

// help with all commands
bot.help((ctx) => {
  return ctx.reply(`/start - О боте
/today city - для получения информации о погоде на текущий день (параметр city опционален)
/now city - для получения прогноза на текущий момент (параметр city опционален)
/schedule city hours:minutes- для получения прогноза по расписанию (параметры city и hours:minutes опциональны: время вводится в формате 00:00, расписание присылается каждый день в указанное время)
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

// command /schedule - starts schedule
let job; 
bot.command('schedule', async (ctx) => {
  const [, param, time] = ctx.message.text.split(' ');
  
  let defaultSchedule = '* */1 * * *';
  const timeRegex = /^\d{2}:\d{2}$/;
  if (time && timeRegex.test(time)) {
    const [ hour, minute ] = time.split(':');
    if (Number(hour) > -1 && Number(hour) < 24 && Number(minute) > -1 && Number(minute) < 60) {
      defaultSchedule = `${minute} ${hour} * * *`;
      ctx.reply(`Вы установили время на ${time}`);
    } else {
      return ctx.reply(`Некорректное время! Попробуйте еще раз!`);
    }
  }

  if (!param) {
    job = schedule.scheduleJob(defaultSchedule, async () => {
      bot.telegram.sendMessage(ctx.chat.id, await getWeatherForToday());
    });
    ctx.reply('Расписание установлено');
  } else {
    try {
      const message = await getWeatherForToday(param);
      if (message !== `Неверный запрос. Попробуйте еще раз!`) {
        job = schedule.scheduleJob(defaultSchedule, async () => {
          ctx.reply(message);
        });
        ctx.reply('Расписание установлено');
      } else {
        ctx.reply(`Неверный запрос. Попробуйте еще раз!`);
      }
    } catch {
      ctx.reply(`Не удалось обработать запрос! Пожалуйста, попробуйте позже!`);
    }
  }
});

// command /stopschedule - stops current schedule
bot.command('stopschedule', (ctx) => {
    if (job) {
        job.cancel();
        ctx.reply('Расписание удалено');
    } else {
      ctx.reply('Нет расписания для удаления');
    }
});

// bots replies with this message if it hadn't been triggered with any of the previous handlers
bot.on('message', (ctx) => ctx.reply('Введите команду. Список команд /help'));

// bot launch
bot.launch();
console.log('Bot is up!');
