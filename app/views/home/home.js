import { h, Component } from 'preact';

import styles from '../../components/home.css';

import Aeris from '../../components/apis/aeris';
import ApiXU from '../../components/apis/apixu';
import DarkSky from '../../components/apis/darksky';
import MapContainer from '../../components/apis/map'
import NationalWeatherService from '../../components/apis/nwspoint';
import OpenWeather from '../../components/apis/openweather';
import WeatherBit from '../../components/apis/weatherbit';
import WeatherUnderground from '../../components/apis/wunderground';

const aerisData = require('../../fixtures/aeris.json');
const apixuData = require('../../fixtures/apixu.json');
const darkSkyData = require('../../fixtures/darksky.json');
const nwsData = require('../../fixtures/nws-point.json');
const openWeatherData = require('../../fixtures/openweathermap.json');
const weatherbitData = require('../../fixtures/weatherbit.json');
const wundergroundData = require('../../fixtures/wunderground.json');


// Conversion functions
// Converts Kelvin to Fahrenheit
const convertKelvinToFahrenheit = (kelvin) => {
  return (kelvin * 9/5 - 459.67).toFixed(2);
};

// Converts Celsius to Fahrenheit
const convertCelsiustoFahrenheit = (celsius) => {
  return ((celsius * (9/5)) + 32).toFixed(2);
};

// Converts UNIX timestamps to human readable dates
const convertUnixTime = (unixTime) => {
  const options = {
    weekday: 'short', year: 'numeric', month: 'short',
    day: 'numeric'
  };

  return new Date(unixTime * 1000).toLocaleDateString('en-us', options);
};

// Converts wind direction in degress to cardinal directions
const convertWindDir = (degrees) => {
  const val = Math.round((((degrees/22.5) + 0.5)) % 16);
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW'
  ];

  return directions[val];
};


// Data massagers for API sources
const aerisDataMassager = (data) => {
  const forecasts = data['response'][0]['periods'];
  const payload = [];

  for (let i = 0; i < 5; i++) {
    payload.push({
      'time': convertUnixTime(forecasts[i]['timestamp']),
      'descrip': forecasts[i]['weather'],
      'maxTemp': forecasts[i]['maxTempF'],
      'minTemp': forecasts[i]['minTempF'],
      'humidity': Math.round(forecasts[i]['humidity']),
      'pop': forecasts[i]['pop'],
      'windDir': forecasts[i]['windDir'],
      'windSpeed': forecasts[i]['windSpeedMPH']
    });
  }

  return payload;
};

const apixuDataMassager = (data) => {
  const forecasts = data['forecast']['forecastday'];
  const payload = [];
  const pop = [];
  const windDir = [];  

  for (let i in forecasts) {
    const hours = forecasts[i]['hour'];

    payload.push({
      'time': convertUnixTime(forecasts[i]['date_epoch']),
      'descrip': forecasts[i]['day']['condition']['text'],
      'maxTemp': forecasts[i]['day']['maxtemp_f'], 
      'minTemp': forecasts[i]['day']['mintemp_f'],
      'humidity': Math.round(forecasts[i]['day']['avghumidity']),
      'pop': Math.round((pop.reduce((a, b) => a + b, 0) / 24) * 100),
      'windDir': convertWindDir(windDir.reduce((a, b) => a + b, 0) / 24),
      'windSpeed': forecasts[i]['day']['maxwind_mph']
    });

    for (let i in hours) {
      pop.push(hours[i]['will_it_rain']);
      windDir.push(hours[i]['wind_degree']);
    }    
  }

  return payload;
};

const darkSkyDataMassager = (data) => {
  const forecasts = data['daily']['data'];
  const payload = [];

  for (let i = 0; i < 5; i++) {
    payload.push({
      'time': convertUnixTime(forecasts[i]['time']),
      'descrip': forecasts[i]['summary'],
      'maxTemp': forecasts[i]['temperatureMax'],
      'minTemp': forecasts[i]['temperatureMin'],
      'humidity': Math.round(forecasts[i]['humidity'] * 100),
      'pop': forecasts[i]['precipProbability'] * 100,
      'pType': forecasts[i]['precipType'],
      'windDir': convertWindDir(forecasts[i]['windBearing']),
      'windSpeed': forecasts[i]['windSpeed']
    });
  }

  return payload;
};

const nwsDataMassager = (data) => {
  const forecasts = data['properties']['periods'];
  const payload = [];
  const minTemps = [];

  for (let i = 1; i < 11; i += 2) {
    minTemps.push(forecasts[i]['temperature']);
  }

  for (let i = 0; i < 10; i += 2) {
    const dateString = forecasts[i]['startTime'];
    const date = convertUnixTime(new Date(dateString.substring(0, dateString.indexOf('T'))).getTime() / 1000);

    payload.push({
      'time': date,
      'descrip': forecasts[i]['detailedForecast'],
      'maxTemp': forecasts[i]['temperature'],
      'minTemp': minTemps[i/2],
      'windDir': forecasts[i]['windDirection'],
      'windSpeed': forecasts[i]['windSpeed']
    });
  }

  return payload;
};

const openWeatherDataMassager = (data) => {
  const forecasts = data['list'];
  const payload = [];

  for (let i in forecasts) {
    payload.push({
      'time': convertUnixTime(forecasts[i]['dt']),
      'descrip': forecasts[i]['weather'][0]['description'],
      'maxTemp': convertKelvinToFahrenheit(forecasts[i]['temp']['max']),
      'minTemp': convertKelvinToFahrenheit(forecasts[i]['temp']['min']),
      'humidity': Math.round(forecasts[i]['humidity']),
      'windDir': convertWindDir(forecasts[i]['deg']),
      'windSpeed': forecasts[i]['speed']
    });
  }

  return payload;
};

const weatherbitDataMassager = (data) => {
  const forecasts = data['data'];
  const payload = [];

  for (let i =0; i < 5; i++) {
    payload.push({
      'time': convertUnixTime(forecasts[i]['ts']),
      'descrip': forecasts[i]['weather']['description'],
      'maxTemp': forecasts[i]['max_temp'],
      'minTemp': forecasts[i]['min_temp'],
      'humidity': Math.round(forecasts[i]['rh']),
      'windDir': forecasts[i]['wind_cdir'],
      'windSpeed': forecasts[i]['wind_spd']
    });
  }

  return payload;
};
     
const wundergroundDataMassager = (data) => {
  const forecasts = data['forecast']['simpleforecast']['forecastday'];
  const payload = [];

  for (let i = 0; i < 5; i++) {
    payload.push({
      'time': convertUnixTime(forecasts[i]['date']['epoch']),
      'descrip': forecasts[i]['conditions'],
      'maxTemp': forecasts[i]['high']['fahrenheit'],
      'minTemp': forecasts[i]['low']['fahrenheit'],
      'humidity': forecasts[i]['avehumidity'],
      'pop': forecasts[i]['pop'],
      'windDir': forecasts[i]['avewind']['dir'],
      'windSpeed': forecasts[i]['avewind']['mph']
    });
  }

  return payload;
};


// Home component
class Home extends Component {
  constructor() {
    super();
    this.state.aerisDaysForecast = aerisDataMassager(aerisData);
    this.state.apixuDaysForecast = apixuDataMassager(apixuData);
    this.state.darkSkyDaysForecast = darkSkyDataMassager(darkSkyData);
    this.state.nwsDaysForecast = nwsDataMassager(nwsData);
    this.state.openWeatherDaysForecast = openWeatherDataMassager(openWeatherData);
    this.state.weatherbitDaysForecast = weatherbitDataMassager(weatherbitData);
    this.state.wundergroundDaysForecast = wundergroundDataMassager(wundergroundData);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  componentDidMount() {
    console.log(this.state.nwsDaysForecast);
  }

  onSearchSubmit(zipCode, time) {
    console.log(zipCode, time);
  }

  render() {
    return (
      <main>
        <p class={styles.text}>Weather forecast aggregator for the NYC Metro Area</p>
        <MapContainer onSearchSubmit={this.onSearchSubmit} />
        <Aeris daysForecast={this.state.aerisDaysForecast} />
        <ApiXU daysForecast={this.state.apixuDaysForecast} />
        <DarkSky daysForecast={this.state.darkSkyDaysForecast} />
        <NationalWeatherService daysForecast={this.state.nwsDaysForecast} />
        <OpenWeather daysForecast={this.state.openWeatherDaysForecast} />
        <WeatherBit daysForecast={this.state.weatherbitDaysForecast} />
        <WeatherUnderground daysForecast={this.state.wundergroundDaysForecast} />
      </main>
    );
  }
}

export default Home;
