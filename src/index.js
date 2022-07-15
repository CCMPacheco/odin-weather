import "./normalize.css";
import "./style.css";

const API_KEY = "8502f1df647a4ceda4c53ab7275395b5";
const IMPERIAL = "imperial";
const METRIC = "metric";
const DAYS = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};
const MONTHS = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};
const UNITS = {
  distance: { metric: "Km/h", imperial: "Mph" },
  temperature: { metric: "°C", imperial: "°F" },
};
const ICONS = {
  "clear sky": '<i class="fa-solid fa-sun icon-large"></i>',
  "few clouds": '<i class="fa-solid fa-cloud-sun icon-large"></i>',
  "scattered clouds": '<i class="fa-solid fa-cloud icon-large"></i>',
  "broken clouds": '<i class="fa-solid fa-cloud icon-large"></i>',
  "overcast clouds": '<i class="fa-solid fa-cloud icon-large"></i>',
  "shower rain": '<i class="fa-solid fa-cloud-showers-heavy icon-large"></i>',
  "light rain": '<i class="fa-solid fa-cloud-showers-heavy icon-large"></i>',
  "moderate rain": '<i class="fa-solid fa-cloud-showers-heavy icon-large"></i>',
  rain: '<i class="fa-solid fa-cloud-rain icon-large"></i>',
  thunderstorm: '<i class="fa-solid fa-cloud-bolt icon-large"></i>',
  snow: '<i class="fa-solid fa-snowflake icon-large"></i>',
  mist: '<i class="fa-solid fa-smog icon-large"></i>',
  smoke: '<i class="fa-solid fa-smog icon-large"></i>',
};
const weekday = { day: "" };
const currentCity = { city: "tucuman" };

const loader = document.getElementById("loading");
const convertBtn = document.querySelector("[data-convert]");
const search = document.getElementById("search");
const searchBtn = document.querySelector("[data-btn-search]");

convertBtn.addEventListener("click", () => {
  if (convertBtn.textContent === "Change to °F") {
    convertBtn.textContent = "Change to °C";
    displayLoading();
    getData(currentCity.city, changeUnits()).then(() => hideLoading());
  } else if (convertBtn.textContent === "Change to °C") {
    convertBtn.textContent = "Change to °F";
    displayLoading();
    getData(currentCity.city, changeUnits()).then(() => hideLoading());
  }
});

searchBtn.addEventListener("click", () => {
  const city = search.value.trim();
  currentCity.city = city;
  displayLoading();
  getData(currentCity.city, changeUnits()).then(() => hideLoading());
  search.value = "";
});

function displayLoading() {
  loader.classList.add("display");
}

function hideLoading() {
  loader.classList.remove("display");
}

function changeUnits() {
  if (convertBtn.textContent === "Change to °F") return METRIC;
  if (convertBtn.textContent === "Change to °C") return IMPERIAL;
}

async function getData(location, unit) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit}&appid=${API_KEY}`,
      { mode: "cors" }
    );
    const cityData = await response.json();
    const { coord } = cityData;
    const responseWeather = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,alerts&units=${unit}&appid=${API_KEY}`,
      { mode: "cors" }
    );
    const weatherData = await responseWeather.json();

    const cityName = document.querySelector("[data-city]");
    cityName.textContent = cityData.name;

    const cityWeather = document.querySelector("[data-weather]");
    cityWeather.textContent = weatherData.current.weather[0].main;

    const iconLarge = document.querySelector("[data-large-icon]");
    iconLarge.innerHTML = `${
      ICONS[weatherData.current.weather[0].description]
    }`;

    const currentTemp = document.querySelector("[data-temp-current]");
    currentTemp.textContent = `${weatherData.current.temp} ${UNITS.temperature[unit]}`;

    const feelsLike = document.querySelector("[data-feels-like]");
    feelsLike.textContent = `${weatherData.current["feels_like"]} ${UNITS.temperature[unit]}`;

    const humidity = document.querySelector("[data-humidity]");
    humidity.textContent = `${weatherData.current.humidity} %`;

    const chanceRain = document.querySelector("[data-chance-rain]");
    chanceRain.textContent = `${weatherData.current.clouds} %`;

    const wind = document.querySelector("[data-wind]");
    wind.textContent = `${weatherData.current["wind_speed"]} ${UNITS.distance[unit]}`;

    getTimeAndDate(weatherData.timezone, weatherData.daily, unit);
  } catch (error) {
    console.log(error);
  }
}

async function getTimeAndDate(timezone, daily, unit) {
  try {
    const response = await fetch(
      `http://worldtimeapi.org/api/timezone/${timezone}`
    );
    const time = await response.json();
    weekday.day = time["day_of_week"];

    const format = time.datetime.split("-");
    const year = format[0];
    const month = MONTHS[format[1]];
    const format2 = format[2].split("T");
    const day = format2[0];
    const format3 = format2[1].split(":");

    const currentDay = `${DAYS[time["day_of_week"]]}, ${day} ${month} ${year}`;

    const currentTime = `${format3[0]}:${format3[1]}`;

    const dateElement = document.querySelector("[data-date]");
    dateElement.textContent = currentDay;

    const timeElement = document.querySelector("[data-time]");
    timeElement.textContent = currentTime;

    forecast(daily, unit);
  } catch (error) {
    console.log(error);
  }
}

function forecast(daily, unit) {
  const main = document.querySelector("[data-forecast]");
  main.textContent = "";

  for (let i = 0; i < 7; i++) {
    if (weekday.day > 6) {
      weekday.day = 0;
    }

    weekday.day += 1;
    main.appendChild(
      createCard(
        DAYS[weekday.day],
        daily[i].temp.max,
        daily[i].temp.min,
        ICONS[daily[i].weather[0].description],
        unit
      )
    );
  }
}

function createCard(day, tempmax, tempmin, icon, unit) {
  const card = document.createElement("div");
  card.classList.add("forecast-card");

  const dayElement = document.createElement("div");
  dayElement.textContent = day;

  const tempMaxElement = document.createElement("div");
  tempMaxElement.classList.add("fs-medium");
  tempMaxElement.classList.add("fw-regular");
  tempMaxElement.textContent = `${parseInt(tempmax)} ${
    UNITS.temperature[unit]
  }`;

  const tempMinElement = document.createElement("div");
  tempMinElement.classList.add("fs-small");
  tempMinElement.classList.add("fw-regular");
  tempMinElement.textContent = `${parseInt(tempmin)} ${
    UNITS.temperature[unit]
  }`;

  const iconElement = document.createElement("div");
  iconElement.innerHTML = icon;

  card.appendChild(dayElement);
  card.appendChild(tempMaxElement);
  card.appendChild(tempMinElement);
  card.appendChild(iconElement);

  return card;
}

function initialize() {
  displayLoading();
  getData(currentCity.city, changeUnits()).then(() => hideLoading());
}

initialize();
