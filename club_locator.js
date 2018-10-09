// in order to use 'remove' function
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
        this.parentNode.removeChild(this);
    }
  };
}

function flyToClub(currentFeature) {
  map.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 15
    });
}

function createPopUp(currentFeature) {
  var popUps = document.getElementsByClassName('mapboxgl-popup');
  if (popUps[0]) popUps[0].remove();


  var popup = new mapboxgl.Popup({closeOnClick: false})
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML('<h3>Sweetgreen</h3>' +
          '<h4>' + currentFeature.properties + '</h4>')
        .addTo(map);
}


function buildLocationList(data) {
  for (i = 0; i < data.features.length; i++) {
    var currentFeature = data.features[i];
    var prop = currentFeature.properties;
    var clubName = currentFeature.name;

    var listings = document.getElementById('map-listings');
    var listing = listings.appendChild(document.createElement('div'));
    listing.className = 'item';
    listing.id = "map-listing-" + i;

    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.dataPosition = i;
    link.innerHTML = clubName;

    var details = listing.appendChild(document.createElement('div'));
    details.innerHTML = prop.address + '<br />'
    details.innerHTML += prop.city + ', ' + prop.state + ' ' + prop.postalCode
    /*
    if (prop.phone) {
      details.innerHTML += ' &middot; ' + prop.phoneFormatted;
    }
    */



    link.addEventListener('click', function(e){
      // Update the currentFeature to the club associated with the clicked link
      var clickedListing = data.features[this.dataPosition];

      // 1. Fly to the point
      flyToClub(clickedListing);

      // 2. Close all other popups and display popup for clicked club
      createPopUp(clickedListing);

      // 3. Highlight listing in sidebar (and remove highlight for all other listings)
      var activeItem = document.getElementsByClassName('active');

      if (activeItem[0]) {
         activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');

    });
  }
}

mapboxgl.accessToken = 'pk.eyJ1IjoiYmFja2VuZGNhcyIsImEiOiJjamxwaXBrMnowMjRmM3Bxd3NxMXRhZHJ4In0.dROdTBHQTYJ0QWleHY8raw';

// This adds the map
var map = new mapboxgl.Map({
  // container id specified in the HTML
  container: 'map',
  // style URL
  style: 'mapbox://styles/mapbox/light-v9',
  // initial position in [long, lat] format
  center: [-77.034084142948, 38.909671288923],
  // initial zoom
  zoom: 13,
  scrollZoom: false
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

var clubs = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -77.034084142948,
          38.909671288923
        ]
      },
      "properties": {
        "phoneFormatted": "(202) 234-7336",
        "phone": "2022347336",
        "address": "1471 P St NW",
        "city": "Washington DC",
        "country": "United States",
        "postalCode": "20005",
        "state": "D.C."
      },
      "email": "email@email.com",
      "name": "Red River Valley Cowpokes"
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -77.049766,
          38.900772
        ]
      },
      "properties": {
        "phoneFormatted": "(202) 507-8357",
        "phone": "2025078357",
        "address": "2221 I St NW",
        "city": "Washington DC",
        "country": "United States",
        "postalCode": "20037",
        "state": "D.C."
      },
      "email": "email2@email.com",
      "name": "Texas Ten Horns"
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -77.043929,
          38.910525
        ]
      },
      "properties": {
        "phoneFormatted": "(202) 387-9338",
        "phone": "2023879338",
        "address": "1512 Connecticut Ave NW",
        "city": "Washington DC",
        "country": "United States",
        "postalCode": "20036",
        "state": "D.C."
      },
      "email": "email3@email.com",
      "name": "dummy club"
    }]
};
// This adds the data to the map
map.on('load', function (e) {
  // This is where your '.addLayer()' used to be, instead add only the source without styling a layer
  map.addSource("places", {
    "type": "geojson",
    "data": clubs
  });
  // Initialize the list
  buildLocationList(clubs);

});

// Club marker values for centering map
var longs = []
var lats = []

// This is where your interactions with the symbol layer used to be
// Now you have interactions with DOM markers instead
clubs.features.forEach(function(marker, i) {
  // Create an img element for the marker
  var el = document.createElement('div');
  el.id = "map-marker-" + i;
  el.className = 'c-map__marker';
  // Add markers to the map at all points
  new mapboxgl.Marker(el, {offset: [0, -23]})
      .setLngLat(marker.geometry.coordinates)
      .addTo(map);

  el.addEventListener('click', function(e){
      // 1. Fly to the point
      flyToClub(marker);

      // 2. Close all other popups and display popup for clicked club
      createPopUp(marker);

      // 3. Highlight listing in sidebar (and remove highlight for all other listings)
      var activeItem = document.getElementsByClassName('active');

      e.stopPropagation();
      if (activeItem[0]) {
         activeItem[0].classList.remove('active');
      }

      var listing = document.getElementById('map-listing-' + i);
      listing.classList.add('active');
  });

  longs.push(marker.geometry.coordinates[0])
  lats.push(marker.geometry.coordinates[1])
});

var bounds = [[Math.min(...longs), Math.min(...lats)], [Math.max(...longs), Math.max(...lats)]]
// center map over markers
map.fitBounds(bounds, {padding: 120});
