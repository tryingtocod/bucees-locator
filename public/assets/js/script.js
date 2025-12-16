// Create the map centered on the US
var map = L.map('map').setView([31.0, -97.0], 5);

// Add base layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

// Buc-ee's icon
var buceesIcon = L.icon({
  iconUrl: 'assets/img/bucees-logo.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

var markerCluster = L.markerClusterGroup();
map.addLayer(markerCluster);
var stores = [];

function parseState(endereco) {
  const parts = endereco.split(',');
  if (parts.length >= 2) {
    const stateZip = parts[parts.length - 1].trim(); // e.g., "Alabama 35613"
    const tokens = stateZip.split(' ');
    if (tokens.length >= 2) tokens.pop(); // remove zip
    return tokens.join(' ');
  }
  return '';
}

function renderMarkers(filterText = '', stateFilter = '') {
  markersLayer.clearLayers();
  const filtered = stores.filter(store => {
    const matchesState = !stateFilter || (store.state && store.state.toLowerCase() === stateFilter.toLowerCase());
    const txt = (store.name + ' ' + store.endereco).toLowerCase();
    const matchesText = !filterText || txt.indexOf(filterText.toLowerCase()) !== -1;
    return matchesState && matchesText;
  });

  filtered.forEach(store => {
    const marker = L.marker([store.latitude, store.longitude], { icon: buceesIcon })
      .bindPopup(`<b>${store.name}</b><br>${store.endereco}`);
    markerCluster.addLayer(marker);
  });

  // update results count UI
  const countEl = document.getElementById('results-count');
  if (countEl) {
    countEl.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;
    // add temporary animation class
    countEl.classList.remove('results-update');
    void countEl.offsetWidth; // force reflow
    countEl.classList.add('results-update');
  }

  if (markerCluster.getLayers().length) {
    map.fitBounds(markerCluster.getBounds(), { padding: [40, 40] });
  } else {
    // no results: return to default view
    map.setView([31.0, -97.0], 5);
  }
}

function debounce(fn, wait) {
  let t;
  return function() {
    const args = arguments;
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), wait);
  };
}

function populateStateFilter() {
  const select = document.getElementById('state-filter');
  const states = Array.from(new Set(stores.map(s => s.state).filter(Boolean))).sort();
  states.forEach(st => {
    const opt = document.createElement('option');
    opt.value = st;
    opt.textContent = st;
    select.appendChild(opt);
  });
}

// helper to attempt fetching from multiple paths (robust across deploys)
function fetchJsonFromPaths(paths) {
  return paths.reduce((p, path) => {
    return p.catch(() => fetch(path).then(r => {
      if (!r.ok) throw new Error('not ok');
      return r.json();
    }));
  }, Promise.reject());
}

// load data and initialize UI
const possiblePaths = [
  'data/bucees.json',
  './data/bucees.json',
  '/data/bucees.json',
  'public/data/bucees.json',
  './public/data/bucees.json',
  '/public/data/bucees.json'
];

fetchJsonFromPaths(possiblePaths)
  .then(data => {
    stores = data.map(s => ({ ...s, state: parseState(s.endereco) }));
    populateStateFilter();
    renderMarkers();

    const searchEl = document.getElementById('search');
    const stateEl = document.getElementById('state-filter');

    const update = debounce(() => renderMarkers(searchEl.value, stateEl.value), 200);
    searchEl.addEventListener('input', update);
    stateEl.addEventListener('change', update);

    // locate button: try plugin, else fallback to geolocation
    const locateBtn = document.getElementById('locate-btn');
    if (locateBtn) {
      locateBtn.addEventListener('click', () => {
        // prefer plugin if available
        if (typeof L.control.locate === 'function') {
          L.control.locate({
            flyTo: true,
            keepCurrentZoomLevel: false,
            strings: { title: 'Show my location' }
          }).addTo(map).start();
          return;
        }

        // fallback: browser geolocation
        if (!navigator.geolocation) {
          alert('Geolocation is not available in your browser');
          return;
        }
        locateBtn.disabled = true;
        locateBtn.textContent = '…';
        navigator.geolocation.getCurrentPosition(pos => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          map.setView([lat, lon], 12);
          const temp = L.circle([lat, lon], { radius: 200, color: '#f97373', fillColor: '#fecaca', fillOpacity: 0.4 }).addTo(map);
          setTimeout(() => map.removeLayer(temp), 6000);
          locateBtn.disabled = false;
          locateBtn.textContent = '📍';
        }, err => {
          alert('Unable to retrieve your location');
          locateBtn.disabled = false;
          locateBtn.textContent = '📍';
        });
      });
    }
  })
  .catch(error => {
    console.error('Error loading JSON from any path:', error);
    const countEl = document.getElementById('results-count');
    if (countEl) countEl.textContent = '0 results (data unavailable)';
  });
