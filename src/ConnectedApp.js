import React, { Component } from 'react';
import { getVenues, getVenuePhoto } from './helpers/foursquare';
import { RUN_DURATION_SECONDS } from './constants';
import App from './App';

const navigationError = () =>
  alert(`oops, your device doesn't have geolocation capabilities`);

class ConnectedApp extends Component {
  state = {
    venues: [],
    venueImages: {},
    query: {
      radius: 100,
      categoryId: process.env.REACT_APP_FOURSQUARE_CATEGORY, // arts & entertainment
    },
    history: [],
    loaded: false,
    started: false,
    stopped: false,
    progressedS: 0,
    watchPositionId: 0,
  }

  startTracking() {
    if ('geolocation' in navigator) {
      const watchPositionId = navigator.geolocation.watchPosition(
        this.onPosition,
        console.warn,
        {
          enableHighAccuracy: true
        }
      );
      this.setState(prevState => ({ ...prevState, watchPositionId }))
    } else {
      navigationError();
    }
  }

  stopTracking() {
    navigator.geolocation.clearWatch(this.state.watchPositionId);
  }

  onPosition = position => {
    const { coords: { latitude, longitude } } = position;

    this.setState(prev => {
      return {
        ...prev,
        position,
        history: [...prev.history, [longitude, latitude]],
        loaded: true,
      };
    });

    getVenues({ latitude, longitude, ...this.state.query }).then(res => {
      const { response: { venues } } = res;
      venues.sort((a, b) => a.location.distance - b.location.distance);
      venues.forEach(venue => {
        if (!this.state.venueImages.hasOwnProperty(venue.id)) {
          getVenuePhoto(venue.id).then(res => {
            if (res.response.photos.count > 0) {
              const { prefix, suffix } = res.response.photos.items[0];
              const url = `${prefix}36x36${suffix}`;
              this.setState(state => ({
                ...state,
                venueImages: {
                  ...state.venueImages,
                  [venue.id]: url,
                },
              }));
            }
          });
        }
      });
      this.setState(prev => ({ ...prev, venues: res.response.venues }));
    });
  };

  startTimer = () => {
    this.setState({ started: true, progressedS: 0 });

    this.timer = setInterval(() => {
      if (RUN_DURATION_SECONDS > this.state.progressedS) {
        this.setState(state => ({
          ...state,
          progressedS: state.progressedS + 1,
        }));
      } else {
        this.stopTimer();
      }
    }, 1000);
  };

  stopTimer = () => {
    clearInterval(this.timer);
    this.setState(s => ({ ...s, started: false, stopped: true }));
  };

  render() {
    return <App
      startTracking={this.startTracking.bind(this)}
      stopTracking={this.stopTracking.bind(this)}
      startTimer={this.startTimer.bind(this)}
      stopTimer={this.stopTimer.bind(this)}
      runState={this.state}
    />
  }
}

export default ConnectedApp;
