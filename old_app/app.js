import React, {useState} from 'react';
import {render} from 'react-dom';

import './app.css';
import img1 from './images/team-1';
import img2 from './images/team-2';
import img3 from './images/team-3';

import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {DataFilterExtension} from '@deck.gl/extensions';
import {MapView} from '@deck.gl/core';
import RangeInput from './range-input';
import {useMemo} from 'react';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/uber-web/kepler.gl-data/master/earthquakes/data.csv'; // eslint-disable-line

// This is only needed for this particular dataset - the default view assumes
// that the furthest geometries are on the ground. Because we are drawing the
// circles at the depth of the earthquakes, i.e. below sea level, we need to
// push the far plane away to avoid clipping them.
const MAP_VIEW = new MapView({
  // 1 is the distance between the camera and the ground
  farZMultiplier: 100
});

const INITIAL_VIEW_STATE = {
  latitude: 36.5,
  longitude: -120,
  zoom: 5.5,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const MS_PER_DAY = 8.64e7;

const dataFilter = new DataFilterExtension({
  filterSize: 1,
  // Enable for higher precision, e.g. 1 second granularity
  // See DataFilterExtension documentation for how to pick precision
  fp64: false
});

function formatLabel(t) {
  const date = new Date(t);
  return `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}`;
}

function getTimeRange(data) {
  if (!data) {
    return null;
  }
  return data.reduce(
    (range, d) => {
      const t = d.timestamp;
      range[0] = Math.min(range[0], t);
      range[1] = Math.max(range[1], t);
      return range;
    },
    [Infinity, -Infinity]
  );
}

function getTooltip({object}) {
  return (
    object &&
    `\
    Time: ${new Date(object.timestamp).toUTCString()}
    Magnitude: ${object.magnitude}
    Depth: ${object.depth}
    `
  );
}

export default function App({data, mapStyle = MAP_STYLE}) {
  const [filter, setFilter] = useState(null);

  const timeRange = useMemo(() => getTimeRange(data), [data]);
  const filterValue = filter || timeRange;

  const layers = [
    data &&
      new ScatterplotLayer({
        id: 'earthquakes',
        data,
        opacity: 0.8,
        radiusScale: 100,
        radiusMinPixels: 1,
        wrapLongitude: true,

        getPosition: d => [d.longitude, d.latitude, -d.depth * 1000],
        getRadius: d => Math.pow(2, d.magnitude),
        getFillColor: d => {
          const r = Math.sqrt(Math.max(d.depth, 0));
          return [255 - r * 15, r * 5, r * 10];
        },

        getFilterValue: d => d.timestamp,
        filterRange: [filterValue[0], filterValue[1]],
        filterSoftRange: [
          filterValue[0] * 0.9 + filterValue[1] * 0.1,
          filterValue[0] * 0.1 + filterValue[1] * 0.9
        ],
        extensions: [dataFilter],

        pickable: true
      })
  ];
  

  return (
    <>
    <div className="navContainer">
      <div className="logo-box">
        <a href="/">
          <img src="images\uzh_logo_e_pos_web_main.jpg"></img>
        </a>
      </div>
      <nav>
        <ul>
          <li className="introNav active"><a href="#introNav">Home</a></li>
          <li className="mapNav"><a href="#mapNav">map</a></li>
          <li className="summaryNav"><a href="#summaryNav">summary</a></li>
          <li className="authorsNav"><a href="#authorsNav">authors</a></li>
        </ul>
      </nav>
    </div>
    <div className="scrollableScreen" id="scrollableScreen">
      <div className="intro page" id="introNav">
        <div className="e">GeoVis </div> 
        <div className="e"> 
            <span className="s"> für es besseres Lebe</span>
        </div>
      </div>
      <div className="mapPage page" id="mapNav">
        <div className="mapContainer">
          <DeckGL
            views={MAP_VIEW}
            layers={layers}
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            getTooltip={getTooltip}
          >
            <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
          </DeckGL>

          {timeRange && (
            <RangeInput
              min={timeRange[0]}
              max={timeRange[1]}
              value={filterValue}
              animationSpeed={MS_PER_DAY * 30}
              formatLabel={formatLabel}
              onChange={setFilter}
            />
          )}
        </div>
      </div>
      <div className="summary page" id="summaryNav">Summary</div>
      <div className="authors page" id="authorsNav">
        <div className="profile-card">
          <div className="img">
            <img src={img1}></img>
          </div>
          <div className="caption">
            <h3>Annina Ardüser</h3>
            <p>GeoVis Expert</p>
          </div>
          <div className="social-links">
            <a href="#"><FontAwesomeIcon icon="fas fa-facebook-f" /></a>
            <a href="#"><FontAwesomeIcon icon="fas fa-instagram" /></a>
            <a href="#"><FontAwesomeIcon icon="fas fa-twitter" /></a>
          </div>
        </div>
        <div className="profile-card">
        <div className="img">
            <img src={img2}></img>
        </div>
        <div className="caption">
          <h3>Fiona Federer</h3>
          <p>GeoVis Expert</p>
          <div className="social-links">
            <a href="#"><FontAwesomeIcon icon="fab fa-facebook-f" /></a>
            <a href="#"><FontAwesomeIcon icon="fab fa-instagram" /></a>
            <a href="#"><FontAwesomeIcon icon="fab fa-twitter" /></a>
          </div>
        </div>
        </div>
          <div className="profile-card">
            <div className="img">
              <img src={img3}></img>
            </div>
            <div className="caption">
              <h3>Silvan Caduff</h3>
              <p>GeoVis Expert</p>
            <div className="social-links">
              <a href="#"><FontAwesomeIcon icon="fab fa-facebook-f" /></a>
              <a href="#"><FontAwesomeIcon icon="fab fa-instagram" /></a>
              <a href="#"><FontAwesomeIcon icon="fab fa-twitter" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export function renderToDOM(container) {
  render(<App />, container);
  require('d3-request').csv(DATA_URL, (error, response) => {
    if (!error) {
      const data = response.map(row => ({
        timestamp: new Date(`${row.DateTime} UTC`).getTime(),
        latitude: Number(row.Latitude),
        longitude: Number(row.Longitude),
        depth: Number(row.Depth),
        magnitude: Number(row.Magnitude)
      }));
      render(<App data={data} />, container);
    }
  });
}