import { h, render, Component } from 'preact';

import styles from '../../../styles/apis.css';

class OpenWeather extends Component {
  render(props) {
    if (props.daysForecast === null) {
      return (
        <section class="openWeather">
          <header>
            <h1>Open Weather Map</h1>
          </header>
          <div>
            <p>Search for something!</p>
          </div>
        </section>
      );
    } else {    
      return (
        <section class="openWeather">
          <header>
            <h1>Open Weather Map</h1>
          </header>
          <div>
            <ul class="forecast_grid">
            {props.daysForecast.map((forecast) => {
              return <li>
                <p>{forecast.time}</p>
                <p>{forecast.descrip}</p>
                <p>High: {forecast.maxTemp}°F</p>
                <p>Low: {forecast.minTemp}°F</p>
                <p>Humidity: {forecast.humidity}%</p>
                <p>Wind Speed: {forecast.windSpeed} mph {forecast.windDir}</p>
              </li>
            })}
            </ul>
          </div>
        </section>
      )
    }
  }
}

export default OpenWeather;