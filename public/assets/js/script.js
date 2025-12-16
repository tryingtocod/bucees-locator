// Criar o mapa centralizado nos EUA
var map = L.map('map').setView([31.0, -97.0], 5);

// Adicionar camada base (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

// Criar o ícone personalizado do Buc-ee’s
var buceesIcon = L.icon({
  iconUrl: 'assets/img/bucees-logo.png',  // Caminho do logo (moved)
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Carregar os dados do JSON (usando data/bucees.json)
fetch('data/bucees.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(store => {
      // Criar marcador com logo do Buc-ee’s
      L.marker([store.latitude, store.longitude], { icon: buceesIcon })
        .addTo(map)
        .bindPopup(`<b>${store.name}</b><br>${store.endereco}`);
    });
  })
  .catch(error => console.error('Erro ao carregar JSON:', error));
