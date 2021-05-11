const map = L.map("map").setView([37.4316, -79.6569], 3);

const basemap = L.tileLayer(
  "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);

// Define color palette

  let colorsExchanges =

    ["#ecf6ff",
      "#d1e3f3",
      "#9ac8e1",
      "#529dcc",
      "#1c6cb1",
      "#08306b"
    ];

// Define data variables

const countries = d3.json("data/countries.geojson");
const firms = d3.csv("data/firms.csv");

// create object to hold legend titles

const labels = {
  exchanges: "Number of cryptocurrency exchanges by country"
};

// Promise.all method for loading data

Promise.all([countries, firms]).then(function(data) {
  const countriesData = data[0];
  const firmsData = data[1];
  const firmsGeojson = {
    type: "FeatureCollection",
    features: [],
  };
  firmsData.forEach(function(row) {
    var feature = {
      type: "Feature",
      properties: {
        REGION: row["Region"],
        COUNTRY: (row["Country"]),
        FIRMS: Number(row["Firms"]),
      },
      geometry: {
        type: "Point",
        coordinates: [Number(row["Long"]), Number(row["Lat"])],
      },
    };
    console.log(feature.properties)
    firmsGeojson.features.push(feature);

  });
  drawMap(countriesData, firmsGeojson);
  // map.setMaxBounds(map.getBounds(firmsGeojson));
});

// DEFINE DRAWMAP FUNCTION
function drawMap(countriesData, firmsGeojson) {
  // add countries
  const dataLayerCountries = L.geoJSON(countriesData, {
    style: function(feature) {
      // style counties with initial default path options
      return {
        color: "#dddddd",
        weight: 1,
        opacity: 1,
        fillOpacity: 1,
        // fillColor: "#1f78b4",
      };
    },
  }).addTo(map)
  .bringToBack();
  console.log(countriesData)

  // define airbnb filter variables
  const allFirms = L.geoJSON(firmsGeojson, {
    pointToLayer: function(feature, ll) {
      return L.circleMarker(ll, {
        weight: 0,
        fillOpacity: 1,
        radius: 5,
        fillColor: "red",
      });
    },
    // onEachFeature: function(feature, layer) {
    //   var tooltip =
    //     "<b>" +
    //     feature.properties.NAME +
    //     "</b>" +
    //     "<br>" +
    //     "Listing type: " +
    //     feature.properties.TYPE +
    //     "<br>" +
    //     "Host ID: " +
    //     feature.properties.HOST_ID +
    //     "<br>" +
    //     "Host number of listings: " +
    //     feature.properties.NUM_LIST +
    //     "<br>" +
    //     "Price: " +
    //     feature.properties.PRICE +
    //     "<br> "
    //   "";
    //   layer.bindTooltip(tooltip);
    //   // zoom to point on click
    //   layer.on('click', function(e) {
    //     map.setView(e.latlng, 16);
    //   });
    //   // when mousing over a layer
    //   layer.on("mouseover", function() {
    //     // change the stroke color and bring that element to the front
    //     layer
    //       .setStyle({
    //         color: "red",
    //         fillColor: "yellow",
    //         weight: 2,
    //         radius: 10,
    //         fillOpacity: 1,
    //       })
    //       .bringToFront();
    //   });
    //   // on mousing off layer
    //   layer.on("mouseout", function() {
    //     // reset the layer style to its original stroke color
    //     layer.setStyle({
    //       fillColor: "red",
    //       radius: 5,
    //       fillOpacity: 1,
    //     });
    //   });
    // },
    filter: function(feature, layer){
      return feature.properties.TYPE == "Entire home/apt";
    },
  });

  const privateRoom = L.geoJSON(firmsGeojson, {
    pointToLayer: function(feature, ll) {
      return L.circleMarker(ll, {
        weight: 0,
        fillOpacity: 1,
        radius: 5,
        fillColor: "red",
      });
    },
    onEachFeature: function(feature, layer) {
      var tooltip =
        "<b>" +
        feature.properties.NAME +
        "</b>" +
        "<br>" +
        "Listing type: " +
        feature.properties.TYPE +
        "<br>" +
        "Host ID: " +
        feature.properties.HOST_ID +
        "<br>" +
        "Host number of listings: " +
        feature.properties.NUM_LIST +
        "<br>" +
        "Price: " +
        feature.properties.PRICE +
        "<br> "
      "";
      layer.bindTooltip(tooltip);
      // zoom to point on click
      layer.on('click', function(e) {
        map.setView(e.latlng, 16);
      });
      // when mousing over a layer
      layer.on("mouseover", function() {
        // change the stroke color and bring that element to the front
        layer
          .setStyle({
            color: "red",
            fillColor: "yellow",
            weight: 2,
            radius: 10,
            fillOpacity: 1,
          })
          .bringToFront();
      });
      // on mousing off layer
      layer.on("mouseout", function() {
        // reset the layer style to its original stroke color
        layer.setStyle({
          fillColor: "red",
          radius: 5,
          fillOpacity: 1,
        });
      });
    },
    filter: function(feature, layer){
      return feature.properties.TYPE == "Private room";
    },
  });
};
