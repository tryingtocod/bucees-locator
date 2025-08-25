// Centralizar nos EUA (Texas mais ou menos no centro)
var map = L.map('map').setView([31.9686, -99.9018], 5);

// Camada de mapa (OpenStreetMap gratuito)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Carregar JSON com as lojas Buc-ee's
fetch('bucees.json')
  .then(response => response.json())
  .then(stores => {
    stores.forEach(store => {
      L.marker([store.latitude, store.longitude])
        .addTo(map)
        .bindPopup(`<b>${store.name}</b>`);
    });
  })
  .catch(error => console.error('Erro ao carregar JSON:', error));