const map = L.map("map").setView([37.4316, -79.6569], 6.8);

const basemap = L.tileLayer(
  "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: "abcd",
    maxZoom: 19
  }
).addTo(map);

const fl = L.esri.featureLayer({
  url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_ZIP_Code_Areas_anaylsis/FeatureServer'
}).addTo(map);
