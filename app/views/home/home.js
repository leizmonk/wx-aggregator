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
const AWS = require("aws-sdk")
const darkSkyData = '';
const nwsData = require('../../fixtures/nws-point.json');
const openWeatherData = require('../../fixtures/openweathermap.json');
const weatherbitData = require('../../fixtures/weatherbit.json');
const wundergroundData = require('../../fixtures/wunderground.json');

const awsConfig = {
  region:'us-west-2',
  accessKeyId: process.env.PREACT_APP_AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.PREACT_APP_AWS_SECRET_ACCESS_KEY  
}

/* TODO: need to dynamically populate key with ZIP searched to get the right file */
const s3Params = {
  Bucket: 'wx-aggregator',
  Key: 'forecast_data/darksky/11435.json',
}

const lambda = new AWS.Lambda(awsConfig);
const s3 = new AWS.S3(awsConfig);

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
  if (typeof data.daily === 'undefined') {
    return false;
  } else {
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
  }
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

  componentWillMount() {
    let getObjectPromise = s3.getObject(s3Params).promise();

    getObjectPromise.then(function(data) {
      console.log(data)

      const output = JSON.stringify(data.Body);
      const darkSkyPayload = JSON.parse(output);

      return darkSkyPayload;
    }).catch(function(err) {
      console.log(err, err.stack);
    }).then(function(darkSkyPayload) {
      // console.log(darkSkyPayload)
      this.setState({darkSkyDaysForecast: darkSkyDataMassager(darkSkyPayload)});
      console.log("##### DID THIS EVEN SET THE STATE ", this.state.darkSkyDaysForecast);
    }.bind(this));
  }

  componentDidMount() {
    console.log(this.state.darkSkyDaysForecast);
    console.log('did this work? let\'s find out!');
  }

  onSearchSubmit(latLng, zipCode, time) {
    // TODO: Hook this up to API Gateway/AWS Lambda
    console.log(latLng, zipCode, time);
    const payload = {
      latLng: latLng,
      zipCode: zipCode,
      time: time
    };

    var params = {
      FunctionName: 'arn:aws:lambda:us-west-2:444167711672:function:wx-aggregator-serverless-dev-darkSkyApi', /* required */
      ClientContext: AWS.util.base64.encode(JSON.stringify('WX-Aggregator')),
      InvocationType: 'RequestResponse',
      LogType: 'Tail',
      Payload: JSON.stringify(payload) /* Strings will be Base-64 encoded on your behalf */,
    };
    lambda.invoke(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
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
