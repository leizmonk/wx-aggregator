import { h, render, Component } from 'preact';
import nyMetroZips from '../../fixtures/zipcodes.json';
import Map, { GoogleApiWrapper } from 'google-maps-react';
import styles from './apis.css';

const lambdaInvoke = require('../utils/invoke');

// Construct an array of the ZIPs we can provide forecast data for to validate against
const zipRange = [];

for (let i in nyMetroZips) {
  zipRange.push(nyMetroZips[i]['zip']);
}

lambdaInvoke.onLoad();

class MapContainer extends Component {
  constructor(props) {
    super(props);    
    this.state = {
      city: '',
      latLng: '',
      state: '',
      zipCode: ''
    }
    this.onMapClicked = this.onMapClicked.bind(this);
  }

  // Wait for map ready and state update to send ZIP
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.google == this.props.google && zipRange.indexOf(this.state.zipCode) > -1) {
      lambdaInvoke.onSearchSubmit(this.state.latLng, this.state.zipCode, Date.now());
    } else if (prevProps.google != this.props.google) {
      console.log('Map loading...');
    } else {
      alert('Sorry, no forecast data available for this ZIP code.');
    }
  }

  // Reverse geocode map click target's ZIP
  onMapClicked(mapProps, map, clickEvent) {
    const google = this.props.google;
    const geocoder = new google.maps.Geocoder;
    const maps = google.maps;

    let targetLat = clickEvent.latLng.lat();
    let targetLng = clickEvent.latLng.lng();

    geocoder.geocode({
      'latLng': { lat: targetLat, lng: targetLng },
    }, (results, status) => {
      if (status == maps.GeocoderStatus.OK) {
        const data = results[0].address_components;

        for (let i in data) {
          if (data[i].types[0] == 'locality' || data[i].types[0] == 'neighborhood') {
            this.setState({city: data[i].long_name});
          }

          if (data[i].types[0] == 'administrative_area_level_1') {
            this.setState({state: data[i].short_name});
          }

          if (data[i].types[0] == 'postal_code') {
            this.setState({zipCode: data[i].long_name});
          }
        }

        this.setState({latLng: targetLat + ',' + targetLng})
      }
    });
  }

  render(props) {
    return (
      <section class={styles.map_container}>
        <div class="search-form">
          <p>Forecast for {this.state.city}, {this.state.state} {this.state.zipCode}</p>
        </div>
        <Map
          google={this.props.google}
          initialCenter={{
            lat: 40.7484,
            lng: -73.985428,
          }}          
          mapTypeControl={false}
          onClick={this.onMapClicked}
          streetViewControl={false}
          zoom={10}
        >       
        </Map>
      </section>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.PREACT_APP_GOOGLE_MAPS_KEY,
  version: '3',
})(MapContainer)