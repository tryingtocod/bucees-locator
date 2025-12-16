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

var markersLayer = L.layerGroup().addTo(map);
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
    markersLayer.addLayer(marker);
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

  if (filtered.length) {
    const group = L.featureGroup(filtered.map(s => L.marker([s.latitude, s.longitude])));
    map.fitBounds(group.getBounds(), { padding: [40, 40] });
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

// load data and initialize UI
fetch('data/bucees.json')
  .then(response => response.json())
  .then(data => {
    stores = data.map(s => ({ ...s, state: parseState(s.endereco) }));
    populateStateFilter();
    renderMarkers();

    const searchEl = document.getElementById('search');
    const stateEl = document.getElementById('state-filter');

    const update = debounce(() => renderMarkers(searchEl.value, stateEl.value), 200);
    searchEl.addEventListener('input', update);
    stateEl.addEventListener('change', update);
  })
  .catch(error => console.error('Error loading JSON:', error));
