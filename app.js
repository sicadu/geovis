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
import {ScatterplotLayer, IconLayer} from '@deck.gl/layers';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
};

// Source data GeoJSON
const DATA_URL =
  './data/e15.json'; // eslint-disable-line

// colour scheme
//teal: #d1eeea,#a8dbd9,#85c4c9,#68abb8,#4f90a6,#3b738f,#2a5674
const POLYGON_COLORS = {
  COLOR_1: [209, 238, 234],
  COLOR_2: [168, 219, 217],
  COLOR_3: [133, 196, 201],
  COLOR_4: [104, 171, 184],
  COLOR_5: [79, 144, 166],
  COLOR_6: [59, 115, 143],
  OTHER: [255,255,255]
};

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
    pitch: 30, // muss 30 sein, damit arcs schön dargestellt werden können
    bearing: 0
  };
  
  const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';
  
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
  
  /* eslint-disable react/no-deprecated */
  export default function App({data, strokeWidth = 1, mapStyle = MAP_STYLE}) {
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
      }),
      // create proportional symbols layers
      new ScatterplotLayer({
        id: 'scatterplot-layer',
        data: './aa_remittances/aa_remittances_IN_GDP_millions_WGS84.json',
        opacity: 0.7,
        stroked: true,
        getPosition: d => [d.X, d.Y], 
        lineWidthMinPixels: 0.5,
        getLineColor: d => [255, 255, 255],

        //size = GDP [$]
        getRadius: a => (Math.sqrt(a.GDP_2017))/Math.PI,
        radiusMinPixels: 3,
        radiusMaxPixels: 40,
        
        //size = Remittance [$]
        //getRadius: f => (Math.sqrt((f.R_IN_2017)*1000000))/Math.PI,  //doesn't work when changing radiusMinPixels, therefore a scaling factor
        //getRadius: f => (Math.sqrt((f.R_IN_2017)*1000000)/Math.PI),
        //radiusMinPixels: 7,

        //attempt: continuous colorscheme
        //getFillColor: colorContinuous({
          //attr: 'R_IN_2017',
          //domain: [0, 1e5],
          //colors: 'BluYl'
        //}),


        // colorscheme: classes (arbitrary --> to be defined!)
        getFillColor: a => {
          if (((a.R_IN_2017)*1000000)/a.GDP_2017 < 0.001) { //define classes!
            return POLYGON_COLORS.COLOR_1;
          } else if (((a.R_IN_2017)*1000000)/a.GDP_2017 < 0.005) {
            return POLYGON_COLORS.COLOR_2;
          } else if (((a.R_IN_2017)*1000000)/a.GDP_2017 < 0.01) {
            return POLYGON_COLORS.COLOR_3;
          } else if (((a.R_IN_2017)*1000000)/a.GDP_2017 < 0.05) {
            return POLYGON_COLORS.COLOR_4;
          } else if (((a.R_IN_2017)*1000000)/a.GDP_2017 < 0.1) {
            return POLYGON_COLORS.COLOR_5;
          } else if (((a.R_IN_2017)*1000000)/a.GDP_2017 < 0.4) {
            return POLYGON_COLORS.COLOR_6;
          };
          //return POLYGON_COLORS.OTHER;
        },
      }),

      new IconLayer({
        //id: 'icon-layer',
        data: './aa_remittances/aa_remittances_IN_GDP_millions_WGS84.json',
        pickable: true,
        // iconAtlas and iconMapping are required
        // getIcon: return a string
        iconAtlas: './images/Remi_in.png',
        iconMapping: ICON_MAPPING,
        getIcon: d => 'marker',
      
        sizeScale: 15,
        getPosition: d => [d.X, d.Y],
        getSize: d => 30,
        //(Math.sqrt(a.GDP_2017))/Math.PI,
        getColor: d => [0, 0, 0, 255]
      }),
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
            <span className="s">Global Patterns</span>
        </div>
      </div>
      <div className="background page" id="backgroundNav">
        <div className= "text-box"> 
          <div className="text-title">Background</div>
            <div className= "text-section">
              <p> Hier kommt der Text hin </p>
            </div>
        </div>
      </div>
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
      <div className="summary page" id="summaryNav">
        <div className= "text-box"> 
          <div className="text-title">Summary</div>
            <div className= "text-section">
              <p> Hier kommt der Text hin </p>
            </div>
        </div>
      </div>
      <div className="references page" id="referencesNav">
        <div className= "text-box">
          <div className="text-title">References</div>
            <div className= "text-section">
              <p> Hier kommt der Text hin </p>
            </div>
        </div>
      </div>
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

  fetch(DATA_URL)
    .then(response => response.json())
    .then(({features}) => {
      render(<App data={features} />, container);
    });
}