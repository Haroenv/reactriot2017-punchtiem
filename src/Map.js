import React, { Component } from 'react';
import { getScore } from './helpers/foursquare';
import InteractiveMap from './components/InteractiveMap';
import Loading from './components/Loading';
import BottomBar, { BeforeRun, AfterRun } from './components/BottomBar';
import { RUN_DURATION_SECONDS } from './constants';

class Foursquare extends Component {
  componentWillMount() {
    this.props.startTracking();
  }

  componentWillUnmount() {
    this.props.stopTracking();
  }

  render() {
    const {
      runState: {
        position,
        venues,
        venueImages,
        history,
        loaded
      },
      showBottom,
      progress
    } = this.props;

    if (loaded === false) {
      return (
        <div style={{ height: 'calc(100vh - 64px)' }}>
          <Loading />
        </div>
      );
    }

    const { coords: { latitude, longitude } } = position;
    const here = [longitude, latitude];

    const closest = venues && venues[0]
      ? {
          name: venues[0].name,
          distance: venues[0].location.distance,
          score: getScore(venues[0].stats),
          heading: 0, // calc direction to walk
        }
      : {};

    return (
      <div>
        <InteractiveMap
          here={here}
          venues={venues}
          venueImages={venueImages}
          history={history}
        />
        {showBottom
          ? <BottomBar
              speed={position.speed}
              progress={progress}
              isNear={closest.distance < 20}
              closest={closest}
            />
          : null}
      </div>
    );
  }
}

const Wrapper = ({
      runState,
      startTimer,
      stopTimer,
      startTracking,
      stopTracking
    }) => (
      <div>
        <Foursquare
          runState={runState}
          startTracking={startTracking}
          stopTracking={stopTracking}
          showBottom={runState.started}
          progress={100 * runState.progressedS / RUN_DURATION_SECONDS}
        />
        {runState.stopped
          ? <AfterRun onStart={startTimer} />
          : !runState.started && <BeforeRun onStart={startTimer} />}
      </div>
);

export default Wrapper;
