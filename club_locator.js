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
      zoom: 6
    });
}

function createPopUp(currentFeature) {
  var popUps = document.getElementsByClassName('mapboxgl-popup');
  if (popUps[0]) popUps[0].remove();


  var popup = new mapboxgl.Popup({closeOnClick: false})
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML('<h3>' + currentFeature.clubName + '</h3>' +
          '<h4>' + currentFeature.properties.address + '</h4>')
        .addTo(map);
}


function buildLocationList(data) {
  for (i = 0; i < data.features.length; i++) {
    var currentFeature = data.features[i];
    var prop = currentFeature.properties;

    var listings = document.getElementById('map-listings');
    var listing = listings.appendChild(document.createElement('div'));
    listing.className = 'item';
    listing.id = "map-listing-" + i;

    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.dataPosition = i;
    link.innerHTML = currentFeature.clubName;

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

      // 4. scroll to listing
      document.getElementById(this.parentNode.id).scrollIntoView({ block: 'start',  behavior: 'instant' });
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
  //center: [-77.034084142948, 38.909671288923],
  center: [-98.431766, 38.505300],
  // initial zoom
  zoom: 1,
  scrollZoom: false
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

jQuery.getJSON("https://gitcdn.link/cdn/tylerklement/fbd62b76025734dfbf22e761fc961bdc/raw/637ad42c205c7004d44f5069d45165272a7b6694/clubs.geojson")
.done(function(clubs) {
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

        // 4. scroll to listing
        document.getElementById(listing.id).scrollIntoView({ block: 'start',  behavior: 'instant' });
    });

    longs.push(marker.geometry.coordinates[0])
    lats.push(marker.geometry.coordinates[1])
  });

  var bounds = [[Math.min(...longs), Math.min(...lats)], [Math.max(...longs), Math.max(...lats)]]
  // center map over markers
  map.fitBounds(bounds, {padding: 70});
})
.fail(function() {
  alert("No clubs retrieved. Check either the CDN or the data's geojson format.")
});