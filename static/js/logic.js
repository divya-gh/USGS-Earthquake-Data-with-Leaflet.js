var map = L.map("mapid", {
  center: [0,0],
  zoom: 3
});

// Adding tile layer to the map
var Streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
}).addTo(map);

var Satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY
});


//================================================================//
//Make an API call to USGS website using their API endpint
//================================================================//

url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Perform a GET request to the query URL
d3.json(url).then(function(data) {
  
      EathquakeDataFeatures = data.features ;
      //print data
      console.log('GeoJson Features:', EathquakeDataFeatures);


    //Function Set color of the Circle - by Depth
    //-----------------------------------------------------//
    function setStyle(d) {
      //console.log(mag)
      if(d >= 90){
        return "#FF0000" ;
      }
      else if(d >= 70 && d < 90){
        return "#FF6633" ;
      }
      else if(d >= 50 && d < 70){
        return "#FF9999" ;
      }
      else if(d >= 30 && d < 50) {
        return "#FFFF00" ;
      }
      else if(d >= 10 && d < 30) {
        return "#99FF99" ;
      }
      else if(d >= -10 && d < 10) {
        return "#009900" ;
      }
      else {
        return '#336666' ;
      }
    }
  
  //Function Set Radius of the Circle - size by magnitude
  //-----------------------------------------------------//
  function size(mag) {
    if(mag >5){
      return mag * 5 ;
    }
    else if(mag > 4) {
      return mag * 4 ;
    }
    else if(mag >= 2){
      return mag * 3 ;
    }
    else if(mag >1){
      return mag *2 ;
    }
    else {
      return mag ;
    }
  }

    // call GeoJSON object and set geojson layer with style
    var mylayer = L.geoJSON(EathquakeDataFeatures, {
        pointToLayer: (feature, latlng) => {
            var mag = feature.properties.mag ;
            var depth = feature.geometry.coordinates[2] ;
            var epoch = feature.properties.time
            var time = new Date(epoch);
            //console.log(depth)
            
            return L.circleMarker(latlng, {
              radius: size(mag),
              fillColor: setStyle(depth),
              color: `#001`,
              weight: 1,
              opacity: 1,
              fillOpacity: 0.7
                }).bindPopup("<h3>Place: " + feature.properties.place + "</h3> <hr> <h4 class='hr_class'>Type: " + feature.properties.type + "</h4> <br> <h4 class='hr_class'>Status: " + feature.properties.status + "</h4><br> <h4 class='hr_class'>Time: " + time + "</h4><br> <h4 class='hr_class'>Magnitude: " + mag+ "</h4><br> <h4 class='hr_class'>Depth: " + depth+ "</h4>");
        },
        onEachFeature: function(feature, layer) {      
                // Set mouse events to change map styling
                var mag = feature.properties.mag ;

                layer.on({
                  // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
                  mouseover: function(event) {
                    layer = event.target;
                    layer.setStyle({
                      radius:size(mag) +4,
                      color: `#001`,
                      weight:3,
                      fillOpacity: 1 });
                             
                  },
                  // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
                  mouseout: function(event) {
                    layer = event.target;
                    layer.setStyle({
                      radius:size(mag),
                      color: `#001`,
                      weight:1,
                      fillOpacity: 0.7
                    });
                  }
                })
              }
    }).addTo(map);


    
      overlayMaps = {
        earthquakes: mylayer
      }

      //createLayerControl(overlayMaps) ;

      });

//Create a base layer object to add to the layer control later
var baseLayer = {
  StreetMap: Streetmap,
  SatelliteMap: Satellite
}

// // Initialize all of the LayerGroups we'll be using
// var earthquake = L.LayerGroup() ;
// var tectonicPlates = L.LayerGroup() ;

// Create an overlays object to add to the layer control
// overlayMap = {
//   Earthquakes : earthquake,
//   Tectonicplates : tectonicPlates
// }

// Create a control for our layers, add our overlay layers to it
L.control.layers(baseLayer).addTo(map);


