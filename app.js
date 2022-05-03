import React, {useState} from 'react';
import {useMemo} from 'react';
import {render} from 'react-dom';

import './app.css';
import img1 from './images/team-1';
import img2 from './images/team-2';
import img3 from './images/team-3';

import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {scaleQuantile} from 'd3-scale';
// for Icon Layer: import {IconLayer} from '@deck.gl/layers';
// used in Scatterplot Script: import {DataFilterExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PowerTwoTone } from '@material-ui/icons';


// Source data GeoJSON
//const DATA_URL =
  //'./data/e15.json'; // eslint-disable-line

// Source data PROP_IN
const DATA_URL_IN = 
'./data/remittances_IN_PROP_centroid_millions.json';  // eslint-disable-line
// Source data PROP_OUT
//const DATA_URL_OUT = 
//'./data/remittances_OUT_PROP_centroid_millions.json';  // eslint-disable-line


  export const inFlowColors = [
    [255, 255, 204],
    [199, 233, 180],
    [127, 205, 187],
    [65, 182, 196],
    [29, 145, 192],
    [34, 94, 168],
    [12, 44, 132]
  ];
  
  export const outFlowColors = [
    [255, 255, 178],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [177, 0, 38]
  ];
  
  const INITIAL_VIEW_STATE = {
    longitude: 6,
    latitude: 50,
    zoom: 3,
    maxZoom: 15,
    pitch: 0,
    bearing: 0
  };
  
  const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';
/* 
////////////////////////////////////////////////////////////////
  // functions Flows
  function calculateArcs(data, selectedCounty) {
    console.log(data);
    if (!data || !data.length) {
      return null;
    }
    if (!selectedCounty) {
      selectedCounty = data.find(f => f.properties.Country === 'Germany');
    }
    const flows = selectedCounty.properties.flows;
    const centroid = selectedCounty.geometry.centroid;
  
    const arcs = Object.keys(flows).map(toId => {
      const f = data[toId];
      return {
        source: centroid,
        target: f.geometry.centroid,
        value: flows[toId]
      };
    });
  
    const scale = scaleQuantile()
      .domain(arcs.map(a => Math.abs(a.value)))
      .range(inFlowColors.map((c, i) => i));
  
    arcs.forEach(a => {
      a.gain = Math.sign(a.value);
      a.quantile = scale(Math.abs(a.value));
    });
  
    return arcs;
  }
  
  function getTooltip({object}) {
    return object && object.properties.Country;
  }
*/
////////////////////////////////////////////////////////////////
  // functions Proportional Symbols

  // Pop-up
function getTooltip({object}) {
  return (
    object &&
    `\
    Country: ${object.COUNTRY}
    GDP: ${object.GDP_2017}
    `
  );
}
  


  ////////////////////////////////////////////////////////////////////////
  // Add all Layers
  /* eslint-disable react/no-deprecated */
  /*export default function App({data, strokeWidth = 1, mapStyle = MAP_STYLE}) {
    const [selectedCounty, selectCounty] = useState(null);
  
    const arcs = useMemo(() => calculateArcs(data, selectedCounty), [data, selectedCounty]);
  
    const layers = [
      new GeoJsonLayer({
        id: 'geojson',
        data,
        stroked: false,
        filled: true,
        getFillColor: [0, 0, 0, 0],
        onClick: ({object}) => selectCounty(object),
        pickable: true
      }),
      new ArcLayer({
        id: 'arc',
        data: arcs,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: d => (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile],
        getTargetColor: d => (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile],
        getWidth: strokeWidth
      })
      
    ];
*/
export default function App({data, mapStyle = MAP_STYLE}) {
  const [filter, setFilter] = useState(null);

  const layers = [
    data &&
      new ScatterplotLayer({
        id: 'proportional',
        data,
        opacity: 0.8,
        radiusScale: 100,
        radiusMinPixels: 1,
        wrapLongitude: true,

        //Formel für Farbe!
        getPosition: d => [d.X, d.Y],
        getRadius: d =>  Math.sqrt(d.GDP_2017)/Math.Pi,
        getFillColor: d => {
          const r = ((d.R_IN_2017) * Math.pow(10,6))/d.GDP_2017; //als variabel
          return [255 - r * 15, r * 5, r * 10]; //werte für Farbschema ändern
        }

        /*getFilterValue: d => d.timestamp,
        filterRange: [filterValue[0], filterValue[1]],
        filterSoftRange: [
          filterValue[0] * 0.9 + filterValue[1] * 0.1,
          filterValue[0] * 0.1 + filterValue[1] * 0.9*/
        //],
        //extensions: [dataFilter], //evtl weg

        //pickable: true
      })
  ];

  return (
    <>
    <div className="navContainer">
      <div className="logo-box">
        <a href="/">
        <img src="./images/uzh_logo_e_pos_web_assoc_zone.jpg" height="70px"></img>
        </a>
      </div>
      <nav>
        <ul>
          <li className="introNav active"><a href="#introNav">Home</a></li>
          <li className="backgroundNav"><a href="#backgroundNav">background</a></li>
          <li className="mapNav"><a href="#mapNav">map</a></li>
          <li className="summaryNav"><a href="#summaryNav">summary</a></li>
          <li className="referencesNav"><a href="#referencesNav">references</a></li>
          <li className="authorsNav"><a href="#authorsNav">authors</a></li>
        </ul>
      </nav>
    </div>
    <div className="scrollableScreen" id="scrollableScreen">
      <div className="intro page" id="introNav">
        <div className="e">Remittance and Migration Flows: </div> 
        <div className="e"> 
            <span className="s"> Development of Global Pattern</span>
        </div>
      </div>
      <div className="background page" id="backgroundNav">Background</div>
      <div className="mapPage page" id="mapNav">
        <div className="mapContainer">
          <DeckGL
            layers={layers}
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            getTooltip={getTooltip}
          >
            <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
          </DeckGL>
        </div>
      </div>
      <div className="summary page" id="summaryNav">Summary</div>
      <div className="references page" id="referencesNav">References</div>
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
          </div>
        </div>
        </div>
          <div className="profile-card">
            <div className="img">
              <img src={img3}></img>
            </div>
            <div className="caption">
              <h3>Silvan Caduuff</h3>
              <p>GeoVis Expert</p>
            <div className="social-links">
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

  fetch(DATA_URL_IN)
    .then(response => response.json())
    .then(({features}) => {
      render(<App data={features} />, container);
    });
}



