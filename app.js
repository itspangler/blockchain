(function() {
  const map = L.map("map", {
    zoomControl: false,
    maxZoom: 7,
    minZoom: 3,
    worldCopyJump: true
  }).setView([30, 0], 3);

  const basemap = L.tileLayer(
    "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: "abcd",
      // noWrap: true
      // maxZoom: 6,
      // minZoom: 2
    }).addTo(map);

  let attributeValue = "exchanges";
  // console.log(attributeValue)

  const zoomHome = L.Control.zoomHome();
  zoomHome.addTo(map);

  const countries = d3.json("data/countries.geojson");
  const firms = d3.json("data/firms.geojson");

  let colorsCountries = [
    "#d1e3f3",
    "#9ac8e1",
    "#529dcc",
    "#1c6cb1",
    "#08306b"
  ];

  // LOAD COUNTRY DATA USING PROMISE ALL

  Promise.all([countries, firms]).then(function(data) {
    const countriesData = data[0];
    const firmsData = data[1];
    drawMap(countriesData, firmsData);
  });

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  };

  // draw map
  function drawMap(countriesData, firmsData) {
    let countryLayer = L.geoJson(countriesData, {
      filter: function(feature) {
        let props = feature.properties
        if ((props.exchanges) > 0) {
          return feature;
        }
      },
      style: function(feature) {
        return {
          color: 'lightgrey',
          weight: 1,
          fillOpacity: 1,
        };
      },
      onEachFeature: function(feature, layer) {
        layer.on('mouseover', function() {
          this.openTooltip();
          layer.setStyle({
            color: "yellow",
            weight: 2,
            fillOpacity: 1,
          })
        });
        layer.on('mouseout', function() {
          this.closeTooltip();
          layer.setStyle({
            color: "lightgrey",
            weight: 1,
            fillOpacity: 1,
          })
        });
        layer.on({
          click: zoomToFeature
        });
      }
    })
    let firms = $.getJSON("data/firms.geojson", function(data) {
      let firmsLayer = L.geoJson(data, {
        pointToLayer: function(feature, ll) {
          let props = feature.properties
          return L.circleMarker(ll, {
            color: '#aa7b02',
            weight: 0.5,
            fillColor: '#ffbc04',
            fillOpacity: 0.8,
            opacity: 0.9,
          });
        },
        filter: function(feature) {
          let props = feature.properties
          if ((props.Firms) > 0) {
            return feature;
          }
        },
        style: function(feature) {
          let props = feature.properties
          let radius = d3.scaleSqrt()
            .domain([0, 1e6 / 2])
            .range([1, 652]);
          return {
            radius: radius(props.Firms)
          }
        },
        onEachFeature: function(feature, layer) {
          let props = feature.properties
          let radius = d3.scaleSqrt()
            .domain([0, 1e6 / 2])
            .range([1, 652]);
          let tooltip = "<h5>" + props.Region + "</h5><b>City/Region:</b> " + props.Country + "<br><b>Number of firms: </b>" + props.Firms.toLocaleString()
          layer.bindTooltip(tooltip);
          layer.on('mouseover', function() {
            this.openTooltip();
            layer.setStyle({
              color: "#aa7b02",
              fillColor: "yellow",
              weight: 0.5,
              fillOpacity: 0.8,
              opacity: 0.9
            })
          });
          layer.on('mouseout', function() {
            this.closeTooltip();
            layer.setStyle({
              fillColor: "#ffbc04",
              radius: radius(props.Firms),
              weight: 0.5,
              fillOpacity: 0.8,
              opacity: 0.9
            });
          });
          layer.on('click', function(e) {
            map.setView(e.latlng, 6);
          });
        }
      })
      countryLayer.addTo(map).bringToBack();
      firmsLayer.addTo(map);
      updateLayer(countryLayer);
      addLegend();
    });
  }
  // FUNCTIONS

  function updateLayer(countryLayer) {
    let breaks = getClassBreaks(countryLayer);
    updateLegend(breaks);
    countryLayer.eachLayer(function(layer) {
      let props = layer.feature.properties;
      // console.log(props[attributeValue]);
      layer.setStyle({
        fillColor: getColor(props[attributeValue], breaks)
      });
    });
  }

  function getClassBreaks(countryLayer) {
    let values = [];
    countryLayer.eachLayer(function(layer) {
      let value = layer.feature.properties[attributeValue];
      values.push(value);
    });
    // console.log(values)
    let clusters = ss.ckmeans(values, 5);
    let breaks = clusters.map(function(cluster) {
      return [cluster[0], cluster.pop()];
    });
    console.log(breaks.length);
    return breaks;
  }

  function getColor(d, breaks) {
    // console.log(breaks);
    if (d <= breaks[0][1]) {
      return colorsCountries[0];
    } else if (d <= breaks[1][1]) {
      return colorsCountries[1];
    } else if (d <= breaks[2][1]) {
      return colorsCountries[2];
    } else if (d <= breaks[3][1]) {
      return colorsCountries[3];
    } else if (d <= breaks[4][1]) {
      return colorsCountries[4];
    }
  };

  function addLegend(breaks) {
    let legendControl = L.control({
      position: "bottomright",
    });
    legendControl.onAdd = function() {
      let legend = L.DomUtil.get("legend");
      L.DomEvent.disableScrollPropagation(legend);
      L.DomEvent.disableClickPropagation(legend);
      return legend;
    };
    legendControl.addTo(map);
    // updateLegend(map);
  };

  function updateLegend(breaks) {
    let legend = $("#legend").html("<h5>" + "Cryptocurrency exchanges" + "<br>" + "by country" + "</h5>");
    for (let i = 0; i <= breaks.length - 1; i++) {
      let color = getColor(breaks[i][0], breaks);
      legend.append(
        "<ul>" + '<span style="background:' +
        color +
        '"></span> ' + "</ul>" +
        "<label>" +
        (breaks[i][0]) +
        " &mdash; " +
        (breaks[i][1])
      );
    }
    console.log(breaks)
  }

})();
