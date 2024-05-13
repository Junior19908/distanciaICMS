var points = [],
  msg_el = document.getElementById('msg'),
  url_osrm_nearest = 'https://router.project-osrm.org/nearest/v1/driving/',
  url_osrm_route = 'https://router.project-osrm.org/route/v1/driving/',
  vectorSource = new ol.source.Vector(),
  vectorLayer = new ol.layer.Vector({
    source: vectorSource
  }),
  styles = {
    route: new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: 8,
        color: [255, 69, 0, 0.8]
      }),
      zIndex: 100
    })
  };
var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    vectorLayer
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-37.065165, -9.186083]),
    zoom: 7
  })
});
map.on('click', function (evt) {
  var coord = ol.proj.toLonLat(evt.coordinate);
  points.push(coord);

  if (points.length === 2) {
    var point1 = points[0].join();
    var point2 = points[1].join();

    fetch(url_osrm_route + point1 + ';' + point2).then(function (r) {
      return r.json();
    }).then(function (json) {
      if (json.code !== 'Ok') {
        msg_el.innerHTML = 'Nenhuma rota encontrada.';
        return;
      }
      var distancia = json.routes[0].distance / 1000; // Distância em quilômetros
      msg_el.innerHTML = '<strong>Rota adicionada. Distância:</strong> ' + distancia.toFixed(2) + ' km';

      var aliquota = parseFloat(document.getElementById('aliquota').value);
      var valorTonelada = parseFloat(document.getElementById('valorTonelada').value);
      var valorFrete ;
      if (distancia <= 100) {
        valorFrete = 17.19;
      }else if (distancia >= 101 && distancia <= 200) {
        valorFrete = 20.45;
      }else if (distancia >= 201 && distancia <= 300) {
        valorFrete = 24.53;
      }else if (distancia >= 301 && distancia <= 400) {
        valorFrete = 29.70;
      }else if (distancia >= 401 && distancia <= 500) {
        valorFrete = 36.22;
      }else if (distancia >= 501 && distancia <= 600) {
        valorFrete = 38.71;
      }else if (distancia >= 601 && distancia <= 700) {
        valorFrete = 40.60;
      }else if (distancia >= 701 && distancia <= 800) {
        valorFrete = 45.61;
      }else if (distancia >= 801 && distancia <= 900) {
        valorFrete = 50.60;
      }else if (distancia >= 901 && distancia <= 1000) {
        valorFrete = 55.61;
      }else if (distancia >= 1001 && distancia <= 1200) {
        valorFrete = 65.58;
      }else {
        valorFrete = 70.00;
      }

      var valorPagarGT;
      valorPagarGT = valorFrete * valorTonelada
      var imposto = valorPagarGT * (aliquota / 100);
      var totalPagar = imposto + valorPagarGT;

      var dadosRecibo = {
        nomeMotorista: document.getElementById('nomeMotorista').value,
        numeroFicha: document.getElementById('numeroFicha').value,
        dataAtual: document.getElementById('dataAtual').value,
        valorFrete: valorPagarGT.toFixed(2),
        imposto: imposto.toFixed(2),
        totalPagar: totalPagar.toFixed(2)
      };
      window.location.href = 'recibo.html?' + new URLSearchParams(dadosRecibo);
      createRoute(json.routes[0].geometry);
    });
    points = []; // Resetar pontos
  }
});

function createRoute(polyline) {
  var route = new ol.format.Polyline({
    factor: 1e5
  }).readGeometry(polyline, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });

  var feature = new ol.Feature({
    type: 'route',
    geometry: route
  });
  feature.setStyle(styles.route);
  vectorSource.addFeature(feature);
}

function imprimirRecibo() {
  var conteudo = document.body.innerHTML;
  var recibo = '<h1>Recibo de Pagamento - ICMS</h1>';
  recibo += '<p><strong>Nome do Motorista:</strong> ' + document.getElementById('nomeMotorista').value + '</p>';
  recibo += '<p>' + msg_el.innerHTML + '</p>';
  recibo += '<p><em>Impresso em: ' + new Date().toLocaleString() + '</em></p>';
  conteudo = recibo;
  window.print();
}
