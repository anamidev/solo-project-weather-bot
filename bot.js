require('dotenv').config();
const fetch = require('node-fetch');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// ответ бота на команду /start
bot.start((ctx) => {
  return ctx.reply('Добро пожаловать в Weather-Today! (Москва)'); 
});

// ответ бота на команду /help
bot.help((ctx) => {
  return ctx.reply(`"Погода" - для получения информации о погоде на текущий день.
"Сейчас" - для получения прогноза на текущий момент`);
}); 

bot.hears('Погода', async (ctx) => { 
  const response = await fetch("https://weatherapi-com.p.rapidapi.com/forecast.json?q=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0&days=1&lang=ru", {
    "method": "GET",
    "headers": {
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "x-rapidapi-host": process.env.X_RAPIDAPI_HOST
    }
  });

  const data = await response.json();

  const { name } = data.location; // location name
  const [ currentDay ] = data.forecast.forecastday; // object with forecast on current day
  const { date }  = currentDay; // current date
  const [ year, month, day ] = date.split('-');
  const { 
    avghumidity,
    avgtemp_c, 
    daily_chance_of_rain, 
    daily_chance_of_snow, 
    maxtemp_c, 
    maxwind_kph, 
    mintemp_c,
    condition: { text },
  } = currentDay.day;
  const [,,,,,day5,,,,,,day11,,,,,,day17,,,,,,day23] = currentDay.hour;

  let firstMessage = `Погода на ${day}-${month}-${year}, ${name}:

Весь день - ${text}

Средняя температура - ${avgtemp_c}°C (от ${mintemp_c} до ${maxtemp_c}°C) 
Влажность - ${avghumidity}%
Вероятность дождя - ${daily_chance_of_rain}%, снега - ${daily_chance_of_snow}%
Макс. скорость ветра - ${maxwind_kph} км/ч`;
  
  await ctx.reply(firstMessage);

  let secondMessage = ``;

  for (let object of [day5,day11,day17,day23]) {
    const temp = `${object.time.slice((object.time.indexOf(' ')) + 1)} - ${object.condition.text}

Температура - ${object.temp_c}°C
Влажность - ${object.humidity}%
Вероятность дождя - ${object.chance_of_rain}%, снега - ${object.chance_of_snow}%
Скорость ветра - ${object.wind_kph} км/ч

`;

    secondMessage += temp;
  }

  ctx.reply(secondMessage);
});

bot.hears('Сейчас', async (ctx) => {
  const response = await fetch("https://weatherapi-com.p.rapidapi.com/forecast.json?q=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0&days=1&lang=ru", {
    "method": "GET",
    "headers": {
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "x-rapidapi-host": process.env.X_RAPIDAPI_HOST
    }
  });

  const data = await response.json();
  const { current } = data;
  const {
    condition: { text },
    temp_c,
    humidity,
    wind_kph,
  } = current;
  
  await ctx.reply(`Погода сейчас - ${text}
Температура - ${temp_c}°C
Влажность - ${humidity}%
Скорость ветра - ${wind_kph} км/ч`);
});

// bot.on это обработчик введенного юзером сообщения,
// можно использовать обработчик текста, голосового сообщения, стикера
bot.on('message', (ctx) => ctx.reply('Введите команду. Список команд /help')) 

// запуск бота
bot.launch() 
