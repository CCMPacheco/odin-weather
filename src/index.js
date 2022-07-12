import "./normalize.css";
import "./style.css";

const API_KEY = "8502f1df647a4ceda4c53ab7275395b5";
const IMPERIAL = "imperial";
const METRIC = "metric";

async function getData(location, units) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${units}&appid=${API_KEY}`,
      { mode: "cors" }
    );
    const cityData = await response.json();
    const { coord } = cityData;
    const responseWeather = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,alerts&units=${units}&appid=${API_KEY}`,
      { mode: "cors" }
    );
    const weatherData = await responseWeather.json();

    console.log(weatherData);
  } catch (error) {
    console.log(error);
  }
}
