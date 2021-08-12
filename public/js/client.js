const getInfoBtn = document.querySelector('#get-info');
const requestResponse = document.querySelector('#request-response');

getInfoBtn.addEventListener('click', async (event) => {
  try {
    const response = await fetch("https://weatherapi-com.p.rapidapi.com/forecast.json?q=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0&days=1&lang=ru", {
      "method": "GET",
      "headers": {
        "x-rapidapi-key": "f4bd715486msh4c6bbbc28eb3e32p11980fjsn9bf81cf0a85a",
        "x-rapidapi-host": "weatherapi-com.p.rapidapi.com"
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
      condition: { icon },
      condition: { text },
    } = currentDay.day;

    requestResponse.innerHTML += `
    <div>
      <hr/>
      <div>${name}</div> 
      <div>Погода на ${day}-${month}-${year}</div>
      <div>Погода на весь день - ${text} <img src="${icon}" alt="..." style="width:32px;height:auto;"/></div>
      <div>Средняя температура - ${avgtemp_c}°C (от ${mintemp_c} до ${maxtemp_c}°C) </div>
      <div>Влажность - ${avghumidity}%</div>
      <div>Вероятность дождя - ${daily_chance_of_rain}%, снега - ${daily_chance_of_snow}%</div>
      <div>Макс. скорость ветра - ${maxwind_kph} км/ч</div>
      <hr/>
    </div>
    `;
    const [,,,,,day5,,,,,,day11,,,,,,day17,,,,,,day23] = currentDay.hour;
    const getHoursForecast = () => {
      let result = '';
      for (let object of [day5,day11,day17,day23]) {
        result = result + `
        <div>
          <div>${object.time.slice((object.time.indexOf(' ')) + 1)} - ${object.condition.text} <img src="${object.condition.icon}" alt="..." style="width:32px;height:auto;"/></div>
          <div>Температура - ${object.temp_c}°C</div>
          <div>Влажность - ${object.humidity}%</div>
          <div>Вероятность дождя - ${object.chance_of_rain}%, снега - ${object.chance_of_snow}%</div>
          <div>Скорость ветра - ${object.wind_kph} км/ч</div>
        </div>
        `;
      };
      return result;
    }
    console.log(getHoursForecast());
    requestResponse.innerHTML += `<div style="display:flex; flex-direction:row;">${getHoursForecast()}</div>`;
  } catch {
    alert('No result');
  }
});
