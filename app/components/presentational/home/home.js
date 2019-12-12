import { h, Component } from 'preact';
import styles from '../../../styles/home.css';

import Aeris from '../forecasts/aeris';
import ApiXU from '../forecasts/apixu';
import DarkSky from '../forecasts/darksky';
import MapContainer from '../../../containers/retrieveForecast'
import NationalWeatherService from '../forecasts/nwspoint';
import OpenWeather from '../forecasts/openweather';
import WeatherBit from '../forecasts/weatherbit';
import WeatherUnderground from '../forecasts/wunderground';

// Home component
class Home extends Component {
  constructor() {
    super();
    this.state.aerisDaysForecast = null;
    this.state.apixuDaysForecast = null;
    this.state.darkSkyDaysForecast = null; 
    this.state.nwsDaysForecast = null;
    this.state.openWeatherDaysForecast = null;
    this.state.weatherbitDaysForecast = null;
    this.state.wundergroundDaysForecast = null;
  }

  componentDidMount() {

  }

  componentDidUpdate() {

  }

  shouldComponentUpdate() {

  }

  render() {
    return (
      <main>
        <p class="text">Weather forecast aggregator for the NYC Metro Area</p>
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
