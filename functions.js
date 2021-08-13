const fetch = require('node-fetch');

const getWeatherForNow = async (city = 'Moscow') => {
  try {
    const response = await fetch(`https://weatherapi-com.p.rapidapi.com/forecast.json?q=${city}&days=1&lang=ru`, {
    "method": "GET",
    "headers": {
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "x-rapidapi-host": process.env.X_RAPIDAPI_HOST
    }
  });

    const data = await response.json();
    const { current } = data;
    const { name } = data.location;
    const {
      condition: { text },
      temp_c,
      humidity,
      wind_kph,
    } = current;
    
    return `${name}
Погода сейчас - ${text}
Температура - ${temp_c}°C
Влажность - ${humidity}%
Скорость ветра - ${(wind_kph / 3.6).toFixed(2)} м/с`;
  } catch {
    return `Неверный запрос. Попробуйте еще раз! 
(Попробуйте ввести название города по-английски)`;
  }

}

// ----------------

const getWeatherForToday = async (city = 'Moscow') => {
  try {
    const response = await fetch(`https://weatherapi-com.p.rapidapi.com/forecast.json?q=${city}&days=1&lang=ru`, {
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
Макс. скорость ветра - ${(maxwind_kph / 3.6).toFixed(2)} м/с`;

    let secondMessage = ``;

    for (let object of [day5,day11,day17,day23]) {
      const temp = `${object.time.slice((object.time.indexOf(' ')) + 1)} - ${object.condition.text}

Температура - ${object.temp_c}°C
Влажность - ${object.humidity}%
Вероятность дождя - ${object.chance_of_rain}%, снега - ${object.chance_of_snow}%
Скорость ветра - ${(object.wind_kph / 3.6).toFixed(2)} м/с

`;

      secondMessage += temp;
    }
    return `${firstMessage}
    
${secondMessage}`;
 
  } catch {
    return `Неверный запрос. Попробуйте еще раз! 
(Попробуйте ввести название города по-английски)`;
  }

};

module.exports = { getWeatherForToday, getWeatherForNow };
