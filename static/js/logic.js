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
  id: "mapbox/satellite-streets-v11",
  accessToken: API_KEY
});

var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});



//================================================================//
//Make an API call to USGS website using their API endpint
//================================================================//

url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

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

// Perform a GET request to the query URL
d3.json(url).then(function(data) {
  
      EathquakeDataFeatures = data.features ;
      //print data
      console.log('GeoJson Features:', EathquakeDataFeatures);


    
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
                      radius:size(mag) +5,
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

    //Create a overlay map for tectonic Plates
    url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
    d3.json(url).then(function(tectonicPlatesData) {

      var myTectonicLayer = L.geoJSON(tectonicPlatesData);


      overlayMaps = {
        Earthquakes: mylayer,
        TectonicLayer : myTectonicLayer
      }

    createLayerControl(overlayMaps) ;
    createLegend();

      
    });
  });

  //=======================================================================//
//function to create a Toggle Control //
//=======================================================================//

    // Creat reate a Toggle Control
    function createLayerControl(overlayMaps){
      //Create a base layer object to add to the layer control later
      var baseLayer = {
        StreetMap: Streetmap,
        TopoMap:OpenTopoMap,
        SatelliteMap: Satellite
      }

      // Create a control for our layers, add our overlay layers to it
      L.control.layers(baseLayer,overlayMaps).addTo(map);
    }


//=======================================================================//
//function to create a Legend //
//=======================================================================//

function createLegend() {
      // Create a legend to display information about our map
      var info = L.control({
        position: "bottomright"
      });
      
      // When the layer control is added, insert a div with the class of "legend"
      info.onAdd = function() {        

      var div = L.DomUtil.create('div', 'info legend'),
      grades = [-10,10,30,50,70,90],
      //upper = [10,30,50,70,90,'+'],
      labels = [];
      
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + setStyle(grades[i] + 1) + '"></i> ' +'<b>' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '</b>' + '<br>' : '+');
    }
      return div;

      };
      
      // Add the info legend to the map
      info.addTo(map);
      
}







