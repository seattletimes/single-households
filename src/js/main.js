// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("component-leaflet-map");

var ich = require("icanhaz");
var data = require("./households.geo.json");

var mapElement = document.querySelector("leaflet-map");
var L = mapElement.leaflet;
var map = mapElement.map;

map.scrollWheelZoom.disable();

var focused = false;

var popupTemplate = require("./_popupTemplate.html");
ich.addTemplate("popupTemplate", popupTemplate);

var onEachFeature = function(feature, layer) {
  var single = parseInt(feature.properties["households_Total Alone"]);
  var married = parseInt(feature.properties["households_Married-couple - No Kids under 18 years"]);

  if (single == 0) {
    var ratio = null;
  } else if (single > married) {
    var ratio = Math.round(single/married) + " to 1";
  } else {
    var ratio = "1 to " + Math.round(married/single);
  }

  layer.bindPopup(ich.popupTemplate({
    single: commafy(single),
    married: commafy(married),
    ratio: ratio
  }));
  layer.on({
    popupopen: function(e) {
      focused = layer;
      layer.setStyle({ weight: 2, fillOpacity: 1, color: '#888'});
    },
    mouseover: function(e) {
      layer.setStyle({ weight: 2, fillOpacity: 1, color: '#888' });
    },
    mouseout: function(e) {
      if (focused && focused == layer) { return }
      layer.setStyle({ weight: 0.5, fillOpacity: 0.5, color: 'white' });
    }
  });
};

map.on("popupclose", function() {
  if (focused) {
    focused.setStyle({ weight: 0.5, fillOpacity: 0.5, color: 'white' });
    focused = false;
  }
});

function commafy( num ) {
  num = num.toString();
  if (!num) return;
  if (num.length >= 4) {
    num = num.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
  }
  return num;
}

function getColor(d) {
  return d > 5 ? '#762a83' :
         d > 3 ? '#9970ab' :
         d > 2 ? '#c2a5cf' :
         d > 1  ? '#e7d4e8' :
         d >= 1/2  ? '#d9f0d3' :
         d >= 1/3  ? '#a6dba0' :
         d >= 1/5  ? '#5aae61' :
                   '#1b7837' ;
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.households_ratio),
    weight: 0.5,
    opacity: 1,
    color: 'white',
    fillOpacity: .6
  };
}

var geojson = L.geoJson(data, {
  style: style, 
  onEachFeature: onEachFeature
}).addTo(map);

