// Conversion functions
const self = module.exports = {
  // Converts Kelvin to Fahrenheit
  convertKelvinToFahrenheit: (kelvin) => {
    return (kelvin * 9/5 - 459.67).toFixed(2);
  },

  // Converts Celsius to Fahrenheit
  convertCelsiustoFahrenheit: (celsius) => {
    return ((celsius * (9/5)) + 32).toFixed(2);
  },

  // Converts UNIX timestamps to human readable dates
  convertUnixTime: (unixTime) => {
    const options = {
      weekday: 'short', year: 'numeric', month: 'short',
      day: 'numeric'
    };

    return new Date(unixTime * 1000).toLocaleDateString('en-us', options);
  },

  // Converts wind direction in degress to cardinal directions
  convertWindDir: (degrees) => {
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
  }
}
