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

  var prop = currentFeature.properties
  var coordinates = currentFeature.geometry.coordinates
  var popupHtml = "<div class='c-map__popup-title'>" + currentFeature.clubName + '</div>'
  popupHtml += "<div class='c-map__popup-content'>"
  if (prop.address != '') {
    popupHtml += prop.address + '<br />'
  }
  popupHtml += prop.city + ', ' + prop.state + ' ' + prop.postalCode + '<br />' +
    '<div class="c-map__popup-buttons-div">' +
    '1-' + prop.phoneFormatted +
    '<a href="mailto:' + currentFeature.email + '">' + currentFeature.email + '</a>' +
    //'<a href="mailto:' + currentFeature.email + '">' +
    //'<button class="c-map__button">Contact</button></a>' +
    '<a href="https://www.google.com/maps/search/' + encodeURI(prop.address + ', ' + prop.city + ', ' + prop.state + ' ' + prop.postalCode) + '" target=_blank><button class="c-map__button">Directions</button></a></div></div>'

  var popup = new mapboxgl.Popup({closeOnClick: false})
        .setLngLat(coordinates)
        .setHTML(popupHtml)
        .addTo(map);
}


function buildLocationList(data) {
  for (i = 0; i < data.features.length; i++) {
    var currentFeature = data.features[i];
    var prop = currentFeature.properties;
    var coordinates = currentFeature.geometry.coordinates

    var listings = document.getElementById('map-listings');
    var listing = listings.appendChild(document.createElement('div'));
    listing.className = 'c-map__sidebar-listings-item';
    listing.id = "map-listing-" + i;
    listing.dataPosition = i

    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'c-map__sidebar-listings-item-title';
    link.dataPosition = i;
    link.innerHTML = currentFeature.clubName;

    var details = listing.appendChild(document.createElement('div'));
    details.className = 'c-map__sidebar-listings-item-details'
    details.innerHTML = ''
    if (prop.address != '') {
      details.innerHTML += prop.address + '<br />'
    }
    details.innerHTML += prop.city + ', ' + prop.state + ' ' + prop.postalCode + '<br />'
    details.innerHTML +=
      '<a href="https://www.google.com/maps/search/' + encodeURI(prop.address + ', ' + prop.city + ', ' + prop.state + ' ' + prop.postalCode) + '" target=_blank class="c-map__main-link">Get directions</a>'
    /*
    if (prop.phone) {
      details.innerHTML += ' &middot; ' + prop.phoneFormatted;
    }
    */


    listing.addEventListener('click', function(e){
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
      this.classList.add('active');

      // 4. scroll to listing
      document.getElementById(this.id).scrollIntoView({ block: 'nearest',  behavior: 'instant' });
    });
  }
}

function runSearch() {
  input = document.getElementById('sidebar-search');
  filter = input.value.toUpperCase();
  listings = document.getElementById("map-listings");
  items = listings.getElementsByClassName("c-map__sidebar-listings-item")

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < items.length; i++) {
      a = items[i].getElementsByTagName("a")[0];
      if (a.innerHTML.toUpperCase().indexOf(filter) == -1) {
          items[i].style.display = "none";
      } else {
        items[i].style.display = "";
      }
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
    // add the source without styling a layer
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

  // interactions with DOM markers
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
        console.log(listing)
        listing.classList.add('active');

        // 4. scroll to listing
        document.getElementById(listing.id).scrollIntoView({ block: 'nearest',  behavior: 'instant' });
    });

    longs.push(marker.geometry.coordinates[0])
    lats.push(marker.geometry.coordinates[1])
  });

  var bounds = [[Math.min(...longs), Math.min(...lats)], [Math.max(...longs), Math.max(...lats)]]
  // center map over markers
  map.fitBounds(bounds, {padding: 70});
})
.fail(function() {
  console.log("No clubs retrieved. Check either the CDN or the data's geojson format.")
});
