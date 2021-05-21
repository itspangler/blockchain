(function() {
  const map = L.map("map", {
      zoomControl: false,
      maxZoom: 6,
      minZoom: 2,
      worldCopyJump: true
  }).setView([30, 60], 2);

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

  // function getRadius(area) {
    // let radius = Math.sqrt(area / Math.PI);

    // return radius * .12;
    // console.log(radius);
  // }

  // LOAD COUNTRY DATA USING PROMISE ALL

  Promise.all([countries, firms]).then(function(data) {
    const countriesData = data[0];
    const firmsData = data[1];
    drawMap(countriesData, firmsData);
  });


  // draw map
  function drawMap(countriesData, firmsData) {
    let countryLayer = L.geoJson(countriesData, {
      style: function(feature) {
        return {
          color: '#444',
          weight: 1,
          fillOpacity: 1,
          radius: 1
        };
      },
    });
    let firms = $.getJSON("data/firms.geojson", function(data) {
      let firmsLayer = L.geoJson(data, {
        pointToLayer: function(feature, ll) {
          let props = feature.properties
          // console.log(props.Firms);
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
          const radius = d3.scaleSqrt()
            .domain([0, 1e6/2])
            .range([1, 652]);
          return {
            radius: radius(props.Firms)
          }
        },
        onEachFeature: function(feature, layer) {
          let props = feature.properties
          let tooltip = "<h4>" + props.Region + "</h4><b>City/Region:</b> " + props.Country + "<br><b>Number of firms: </b>" + props.Firms.toLocaleString()
          layer.bindTooltip(tooltip);
          layer.on('mouseover', function() {
            this.openTooltip();
          });
          layer.on('mouseout', function() {
            this.closeTooltip();
          });
          layer.on('click', function(e) {
            map.setView(e.latlng, 6);
          });
        }
      })
      countryLayer.addTo(map).bringToBack();
      firmsLayer.addTo(map);
    });

    addLegend();
    updateLayer(countryLayer);
  }
  // FUNCTIONS

  function updateLayer(countryLayer) {
    var breaks = getClassBreaks(countryLayer);
    countryLayer.eachLayer(function(layer) {
      let props = layer.feature.properties;
      // console.log(props[attributeValue]);
      layer.setStyle({
        fillColor: getColor(props[attributeValue], breaks)
      });
    });
  }

  function getClassBreaks(countryLayer) {
    var values = [];
    countryLayer.eachLayer(function(layer) {
      let value = layer.feature.properties[attributeValue];
      values.push(value);
    });
    // console.log(values)
    var clusters = ss.ckmeans(values, 6);
    var breaks = clusters.map(function(cluster) {
      return [cluster[0], cluster.pop()];
    });
    console.log(breaks);
    return breaks;
  }

  let colorsCountries = ["#FFFFFF",
    "#d1e3f3",
    "#9ac8e1",
    "#529dcc",
    "#1c6cb1",
    "#08306b"
  ];

  function getColor(d, breaks) {
    if (d <= 0) {
      return colorsCountries[0];
    } else if (d <= breaks[1][1]) {
      return colorsCountries[1];
    } else if (d <= breaks[2][1]) {
      return colorsCountries[2];
    } else if (d <= breaks[3][1]) {
      return colorsCountries[3];
    } else if (d <= breaks[4][1]) {
      return colorsCountries[4];
    } else if (d <= breaks[5][1]) {
      return colorsCountries[5];
    }
  };

  function addLegend(breaks) {
    var legendControl = L.control({
      position: "bottomleft",
    });
    legendControl.onAdd = function() {
      var legend = L.DomUtil.get("legend");
      L.DomEvent.disableScrollPropagation(legend);
      L.DomEvent.disableClickPropagation(legend);
      return legend;
    };
    legendControl.addTo(map);
    updateLegend(map);
  }

  function updateLegend(breaks) {
    // select the legend, add a title, begin an unordered list and assign to a variable
    var legend = $("#legend").html("<h5>" + "Exchanges" + "</h5>");

    // loop through the Array of classification break values
    for (var i = 0; i <= breaks.length - 1; i++) {
      var color = getColor(breaks[i][0], breaks);
      legend.append(
        "<ul>" + '<span style="background:' +
        color +
        '"></span> ' + "</ul>" +
        "<label>" +
        (breaks[i][0]) +
        " &mdash; " +
        (breaks[i][1]) +
        " %</label>"
      );
    }
  }

})();
