const aerisData = require('../../fixtures/aeris.json')
const apixuData = require('../../fixtures/apixu.json')
const darkSkyData = require('../../fixtures/darksky.json')
const nwsData = require('../../fixtures/nws-point.json')
const openWeatherData = require('../../fixtures/openweathermap.json')
const unitConversion = require('./unitconversion')
const weatherbitData = require('../../fixtures/weatherbit.json')
const wundergroundData = require('../../fixtures/wunderground.json')

// Data mappers for JSON returned by APIs
const self = module.exports = {
  aerisDataMapper: (data) => {
    const forecasts = data['response'][0]['periods']
    const payload = []

    for (let i = 0; i < 5; i++) {
      payload.push({
        'time': unitConversion.convertUnixTime(forecasts[i]['timestamp']),
        'descrip': forecasts[i]['weather'],
        'maxTemp': forecasts[i]['maxTempF'],
        'minTemp': forecasts[i]['minTempF'],
        'humidity': Math.round(forecasts[i]['humidity']),
        'pop': forecasts[i]['pop'],
        'windDir': forecasts[i]['windDir'],
        'windSpeed': forecasts[i]['windSpeedMPH']
      });
    }

    return payload
  },

  apixuDataMapper: (data) => {
    const forecasts = data['forecast']['forecastday']
    const payload = []
    const pop = []
    const windDir = []  

    for (let i in forecasts) {
      const hours = forecasts[i]['hour']

      payload.push({
        'time': unitConversion.convertUnixTime(forecasts[i]['date_epoch']),
        'descrip': forecasts[i]['day']['condition']['text'],
        'maxTemp': forecasts[i]['day']['maxtemp_f'], 
        'minTemp': forecasts[i]['day']['mintemp_f'],
        'humidity': Math.round(forecasts[i]['day']['avghumidity']),
        'pop': Math.round((pop.reduce((a, b) => a + b, 0) / 24) * 100),
        'windDir': unitConversion.convertWindDir(windDir.reduce((a, b) => a + b, 0) / 24),
        'windSpeed': forecasts[i]['day']['maxwind_mph']
      })

      for (let i in hours) {
        pop.push(hours[i]['will_it_rain'])
        windDir.push(hours[i]['wind_degree'])
      }    
    }

    return payload
  },

  darkSkyDataMapper: (data) => {
    const forecasts = data['daily']['data']
    const payload = []

    for (let i = 0; i < 5; i++) {
      payload.push({
        'time': unitConversion.convertUnixTime(forecasts[i]['time']),
        'descrip': forecasts[i]['summary'],
        'maxTemp': forecasts[i]['temperatureMax'],
        'minTemp': forecasts[i]['temperatureMin'],
        'humidity': Math.round(forecasts[i]['humidity'] * 100),
        'pop': forecasts[i]['precipProbability'] * 100,
        'pType': forecasts[i]['precipType'],
        'windDir': unitConversion.convertWindDir(forecasts[i]['windBearing']),
        'windSpeed': forecasts[i]['windSpeed']
      })
    }

    console.log('parsed api response: ', payload)
    return payload
  },

  nwsDataMapper: (data) => {
    const forecasts = data['properties']['periods']
    const payload = []
    const minTemps = []

    for (let i = 1; i < 11; i += 2) {
      minTemps.push(forecasts[i]['temperature'])
    }

    for (let i = 0; i < 10; i += 2) {
      const dateString = forecasts[i]['startTime']
      const date = unitConversion.convertUnixTime(new Date(dateString.substring(0, dateString.indexOf('T'))).getTime() / 1000)

      payload.push({
        'time': date,
        'descrip': forecasts[i]['detailedForecast'],
        'maxTemp': forecasts[i]['temperature'],
        'minTemp': minTemps[i/2],
        'windDir': forecasts[i]['windDirection'],
        'windSpeed': forecasts[i]['windSpeed']
      })
    }

    return payload
  },

  openWeatherDataMapper: (data) => {
    const forecasts = data['list']
    const payload = []

    for (let i in forecasts) {
      payload.push({
        'time': unitConversion.convertUnixTime(forecasts[i]['dt']),
        'descrip': forecasts[i]['weather'][0]['description'],
        'maxTemp': unitConversion.convertKelvinToFahrenheit(forecasts[i]['temp']['max']),
        'minTemp': unitConversion.convertKelvinToFahrenheit(forecasts[i]['temp']['min']),
        'humidity': Math.round(forecasts[i]['humidity']),
        'windDir': unitConversion.convertWindDir(forecasts[i]['deg']),
        'windSpeed': forecasts[i]['speed']
      })
    }

    return payload
  },

  weatherbitDataMapper: (data) => {
    const forecasts = data['data']
    const payload = []

    for (let i = 0; i < 5; i++) {
      payload.push({
        'time': unitConversion.convertUnixTime(forecasts[i]['ts']),
        'descrip': forecasts[i]['weather']['description'],
        'maxTemp': forecasts[i]['max_temp'],
        'minTemp': forecasts[i]['min_temp'],
        'humidity': Math.round(forecasts[i]['rh']),
        'windDir': forecasts[i]['wind_cdir'],
        'windSpeed': forecasts[i]['wind_spd']
      })
    }

    return payload
  },
       
  wundergroundDataMapper: (data) => {
    const forecasts = data['forecast']['simpleforecast']['forecastday']
    const payload = []

    for (let i = 0; i < 5; i++) {
      payload.push({
        'time': unitConversion.convertUnixTime(forecasts[i]['date']['epoch']),
        'descrip': forecasts[i]['conditions'],
        'maxTemp': forecasts[i]['high']['fahrenheit'],
        'minTemp': forecasts[i]['low']['fahrenheit'],
        'humidity': forecasts[i]['avehumidity'],
        'pop': forecasts[i]['pop'],
        'windDir': forecasts[i]['avewind']['dir'],
        'windSpeed': forecasts[i]['avewind']['mph']
      })
    }

    return payload
  }
}