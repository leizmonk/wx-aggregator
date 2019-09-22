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
