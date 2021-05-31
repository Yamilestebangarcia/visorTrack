/*cosas que hacer */
//css movil

/* ----------------Variables del HTML ---------------------------*/
const $file = document.getElementById("file");
const $nombre = document.getElementById("nombre");
const $desnivelPositivo = document.getElementById("desnivelPositivo");
const $desnivelNegativo = document.getElementById("desnivelNegativo");
const $creador = document.getElementById("creador");
const $distancia = document.getElementById("distancia");
const $alturaMin = document.getElementById("alturaMin");
const $alturaMax = document.getElementById("alturaMax");
const $mapa = document.getElementById("mapa");
const $mapa_info = document.getElementById("mapa_info");
const $info = document.getElementById("info");
const $cargar = document.getElementById("cargar");
const $error = document.getElementById("error");
const $grafica = document.getElementById("grafica");
const $form = document.getElementById("form");
const $loader = document.getElementById("loader");
const $nav_ul = document.getElementById("nav_ul");
const $checkboxBaseMap = document.querySelectorAll(
  ".leaflet-control-layers-selector"
);
const parser = new DOMParser();
let latLong;
let mymap;
let Puntografica;
let text;
let elev;
let menuVisible = true;

/*servidores de capas base*/
const maptillerOutdoor =
  "https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=JApHX2LYyHexQw1jhT4J";
const cycle = "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}";
// "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=467b139a90ae425baeeb1a2de27167bd";

const Landscape =
  "https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=467b139a90ae425baeeb1a2de27167bd";
const outdoors =
  "https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=467b139a90ae425baeeb1a2de27167bd";
/*capa base*/
const capaBase = L.tileLayer(maptillerOutdoor, {
  maxZoom: 18,
  attribution: "yamil esteban garcia",
});
const orto = L.tileLayer.wms(
  "http://www.ign.es/wms-inspire/pnoa-ma?SERVICE=WMS&",
  {
    layers: "OI.OrthoimageCoverage", //nombre de la capa (ver get capabilities)
    format: "image/jpeg",
    transparent: true,
    version: "1.3.0", //wms version (ver get capabilities)
    attribution:
      "PNOA WMS. Cedido por © Instituto Geográfico Nacional de España",
  }
);
const googleHybrid = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);
/*propiedades icono */
const iconInicio = L.divIcon({
  className: "inicio-icon",
  iconSize: [10, 10],
});

/* ----------------main Parseado---------------------------*/
const txt = `<?xml version="1.0" encoding="UTF-8"?>

<gpx creator="Wikiloc - https://www.wikiloc.com" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>Wikiloc - Cruces de la Alfaguara ( Cuatro cruces, Alfacar, Víznar, Mae...</name>
    <link href="https://www.wikiloc.com/hiking-trails/cruces-de-la-alfaguara-cuatro-cruces-alfacar-viznar-maestros-y-nivar-29107399">
      <text>Cruces de la Alfaguara ( Cuatro cruces, Alfacar, Víznar, Mae... on Wikiloc</text>
    </link>
    <time>2018-09-29T15:23:19Z</time>
  </metadata>
  <trk>
    <name>Cruces de la Alfaguara ( Cuatro cruces, Alfacar, Víznar, Mae...</name>
    <cmt></cmt>
    <desc></desc>
    <trkseg>
    <trkpt lat="37.285963" lon="-3.501341">
    <ele>1472.385</ele>
    <time>2019-11-16T09:26:49Z</time>
  </trkpt>
  <trkpt lat="37.286561" lon="-3.500931">
    <ele>1472.389</ele>
    <time>2019-11-16T09:28:15Z</time>
  </trkpt>
  <trkpt lat="37.286964" lon="-3.500889">
    <ele>1477.617</ele>
    <time>2019-11-16T09:28:49Z</time>
  </trkpt>
  <trkpt lat="37.287204" lon="-3.500318">
    <ele>1483.608</ele>
    <time>2019-11-16T09:30:08Z</time>
  </trkpt>
    </trkseg>
  </trk>
</gpx>`;

const parsear = (txt) => {
  latLong = new Array();
  /*-----------------------Obtengo las etiquetas-----------------------------------*/

  const xmlDoc = parser.parseFromString(txt, "text/xml");
  const trkpt = xmlDoc.getElementsByTagName("trkpt");
  const ele = xmlDoc.getElementsByTagName("ele");

  /*-----------------------creo los arrays de longlat y elevacion-----------------------------------*/
  for (i = 0; i < trkpt.length; i++) {
    latLong.push(longitudLatitud(trkpt[i]));
  }
  elev = new Array();
  for (i = 0; i < ele.length; i++) {
    elev.push(Math.floor(ele[i].textContent));
  }
  /*-----------------------cargo el mapa-----------------------------------*/
  if (latLong.length != 0) {
    CargarMapa(latLong[0][0], latLong[0][1], latLong); //param posicion inicial del mapa
    /*-----------------------inserto la informacion-----------------------------------*/
    $creador.innerText =
      "Creado por: \n " + parsearEtiquetaAtributo(txt, "gpx", "creator");
    $nombre.innerText = "Nombre del track: \n " + nombre(txt);

    $desnivelNegativo.innerText = `Desnivel acumulado negativo: \n${
      desnivelAcumulado(elev)[1]
    } m`;
    $desnivelPositivo.innerText = `Desnivel acumulado Positivo: \n ${
      desnivelAcumulado(elev)[0]
    } m`;
    $alturaMin.innerText = `Altura Minima: \n ${desnivelAcumulado(elev)[3]} m`;
    $alturaMax.innerText = `Altura Maxima: \n ${desnivelAcumulado(elev)[2]} m`;
    $distancia.innerText = `Distancia recorrida: ${calculoDistacia(
      latLong
    )} Km`;

    crearGrafica(elev);
  } else {
    $error.classList.remove("quitar");
  }
};
/*-----------------------calculo de distancias-----------------------------------*/
const calculoDistacia = (latLong) => {
  let distancia = 0;

  for (i = 0; i < latLong.length - 1; i++) {
    distancia += distanciaDosPuntos(latLong[i], latLong[i + 1]);
  }
  return distancia;
};

const distanciaDosPuntos = ([lat1, lon1], [lat2, lon2]) => {
  const toRadian = (angle) => (Math.PI / 180) * angle;
  const distance = (a, b) => (Math.PI / 180) * (a - b);
  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = distance(lat2, lat1);
  const dLon = distance(lon2, lon1);

  lat1 = toRadian(lat1);
  lat2 = toRadian(lat2);

  // Haversine Formula
  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.asin(Math.sqrt(a));

  let finalDistance = RADIUS_OF_EARTH_IN_KM * c;
  return finalDistance;
};
/*-----------------------calculo elevacion-----------------------------------*/
desnivelAcumulado = (elev) => {
  let desnivelPositivo = 0;
  let desnivelNegativo = 0;
  let AlturaMax = elev[0];
  let AlturaMin = elev[0];
  for (i = 0; i < elev.length - 1; i++) {
    elev[i + 1] = Number(elev[i + 1]);
    elev[i] = Number(elev[i]);
    if (elev[i + 1] - elev[i] > 0) {
      desnivelPositivo += elev[i + 1] - elev[i];
    } else {
      desnivelNegativo += elev[i + 1] - elev[i];
    }
    if (AlturaMax < elev[i + 1]) {
      AlturaMax = elev[i + 1];
    }
    if (AlturaMin > elev[i + 1]) {
      AlturaMin = elev[i + 1];
    }
  }
  return Array(desnivelPositivo, desnivelNegativo, AlturaMax, AlturaMin);
};
/*-----------------------Captura de datos del gpx-----------------------------------*/
const parsearEtiquetaAtributo = (txt, etiqueta, atributo) => {
  try {
    const xmlDoc = parser.parseFromString(txt, "text/xml");
    const x = xmlDoc.getElementsByTagName(etiqueta);
    return x[0].getAttribute(atributo);
  } catch (error) {
    $nombre.innerText = "Error archivo corrupto";
  }
};
const nombre = (txt) => {
  const xmlDoc = parser.parseFromString(txt, "text/xml");
  let metadata = xmlDoc.getElementsByTagName("metadata");
  return metadata.item(0).childNodes.item(1).textContent;
};
const longitudLatitud = (trkpt) => {
  const lat = trkpt.getAttribute("lat");
  const long = trkpt.getAttribute("lon");
  return Array(lat, long);
};

/* ----------------Cargo el mapa y track----------------------------*/
CargarMapa = (lat, long, latLong) => {
  //creo mapa
  mymap = L.map("mapa").setView([lat, long], 12.5);
  /*creo la capa*/

  capaBase.addTo(mymap);
  googleHybrid.addTo(mymap);
  googleHybrid.setOpacity(0);

  orto.addTo(mymap);
  orto.setOpacity(0);
  L.control
    .scale({
      imperial: false,
    })
    .addTo(mymap);
  //inserto iconos

  L.marker([latLong[0][0], latLong[0][1]], { icon: iconInicio }).addTo(mymap);

  const iconFinal = L.divIcon({
    className: "final-icon",
    iconSize: [10, 10],
  });

  L.marker([latLong[latLong.length - 1][0], latLong[latLong.length - 1][1]], {
    icon: iconFinal,
  }).addTo(mymap);
  let icon;
  for (i = 1; i < latLong.length - 1; i++) {
    icon = L.marker([latLong[i][0], latLong[i][1]], {
      icon: L.divIcon({
        className: "hover-icon " + i,
        iconSize: [10, 10],
      }),
    }).addTo(mymap).bindPopup(`Latitud: ${latLong[i][0]}<br/>
      Longitud: ${latLong[i][1]}<br/>
      Elevación: ${elev[i]} m`);

    icon.on("mouseover", function (e) {
      this.openPopup();
    });

    icon.on("mouseout", function (e) {
      this.closePopup();
    });
  }

  polyline = new L.polyline(latLong, {
    smoothFactor: 0,
    className: "track_cargado",
  }).addTo(mymap);
  mymap.fitBounds(polyline.getBounds());
};

const eliminarElementosMapa = (polyline) => {
  map.removeLayer(polyline);
};

/*-----------------------graficas-----------------------------------*/

const crearGrafica = (elev) => {
  //Construyo la informacion para hacer la grafica

  const datos = new Array();
  for (i = 0; i < elev.length; i++) {
    datos.push({ value: elev[i], year: String(i + 2000) });
  }

  new Morris.Line({
    // ID of the element in which to draw the chart.
    element: "grafica",
    // Chart data records -- each entry in this array corresponds to a point on
    // the chart.
    data: datos,
    // The name of the data record attribute that contains x-values.
    xkey: "year",
    // A list of names of data record attributes that contain y-values.
    ykeys: ["value"],
    // Labels for the ykeys -- will be displayed when you hover over the
    // chart.
    labels: ["yamil"],
    axes: "y",
  });
};

/* ----------------eventos del HTML ---------------------------*/
document.addEventListener("click", (e) => {
  console.log(e.target.classList);
  if (e.target.getAttribute("id") == "btnCargar") {
    $cargar.classList.remove("quitar");
    $form.classList.remove("quitar");
    $mapa_info.classList.remove("quitar");
    $grafica.classList.remove("quitar");

    if (!$error.classList.contains("quitar")) {
      $error.classList.add("quitar");
    }
    $file.value = "";
  }
  if (e.target.getAttribute("id") == "maptillerOutdoor") {
    orto.setOpacity(0);
    googleHybrid.setOpacity(0);
    capaBase.setUrl(maptillerOutdoor, false);
  }
  if (e.target.getAttribute("id") == "cycle") {
    orto.setOpacity(0);
    googleHybrid.setOpacity(0);
    capaBase.setUrl(cycle, false);
  }
  if (e.target.getAttribute("id") == "Landscape") {
    orto.setOpacity(0);
    googleHybrid.setOpacity(0);
    capaBase.setUrl(Landscape, false);
  }
  if (e.target.getAttribute("id") == "outdoors") {
    orto.setOpacity(0);
    googleHybrid.setOpacity(0);
    capaBase.setUrl(outdoors, false);
  }
  if (e.target.getAttribute("id") == "googleHybrid") {
    orto.setOpacity(0);
    googleHybrid.setOpacity(1);
  }
  if (e.target.getAttribute("id") == "orto") {
    googleHybrid.setOpacity(0);
    orto.setOpacity(1);
  }
  if (
    e.target.getAttribute("id") == "hamburgesa" ||
    e.target.classList[0] == "hamburgesa"
  ) {
    if (menuVisible) {
      $nav_ul.classList.add("poner");
      menuVisible = false;
    } else {
      $nav_ul.classList.remove("poner");
      menuVisible = true;
    }
  }
});

$file.addEventListener("change", (e) => {
  $form.classList.add("quitar");
  $loader.classList.remove("quitar");
  if (mymap != null) {
    mymap.off();
    mymap.remove();
    mymap = null;
  }

  const input = e.target;

  const reader = new FileReader();
  reader.onload = function () {
    const text = reader.result;
    $loader.classList.add("quitar");
    $cargar.classList.add("quitar");
    $mapa_info.classList.remove("quitar");
    $grafica.classList.remove("quitar");
    parsear(text);
  };

  reader.readAsText(input.files[0]);
});

document.addEventListener("mouseover", (e) => {
  /*muestra el punto en la grafica cunado se esta por encima del punto en el mapa*/
  if (e.target.classList[1] == "hover-icon") {
    const circulos = document.querySelectorAll("circle");

    circulos[e.target.classList[2]].classList = "circulo-visible";
  }
  /*muetra el punto en el mapa cuando se esta en la grafica*/
  if (
    e.target.getAttribute("cx") != null &&
    e.target.getAttribute("cy") != null
  ) {
    let PosicionY = document.querySelector(
      ".morris-hover-row-label"
    ).textContent;
    let ElevacionX = document
      .querySelector(".morris-hover-point")
      .textContent.split(":")[1]
      .trim();

    const iconGrafica = L.divIcon({
      className: "grafica-icon",
      iconSize: [10, 10],
    });
    Puntografica = L.marker(
      [latLong[PosicionY - 2000][0], latLong[PosicionY - 2000][1]],
      {
        icon: iconGrafica,
      }
    )
      .addTo(mymap)
      .bindPopup(
        `Latitud: ${latLong[PosicionY - 2000][0]}<br/>
        Longitud: ${latLong[PosicionY - 2000][1]}<br/>
        Elevacion: ${ElevacionX}`
      )
      .openPopup();
  }
});

document.addEventListener("mouseout", (e) => {
  //ELIMINA LOS PUNTOS DE LA GRAFICA
  if (e.target.classList[1] == "hover-icon") {
    const circulos = document.querySelectorAll("circle");
    circulos[e.target.classList[2]].classList = "";
  }
  //ELIMINA LOS PUNTOS DEL MAPA
  if (
    e.target.getAttribute("cx") != null &&
    e.target.getAttribute("cy") != null &&
    Puntografica != undefined
  ) {
    Puntografica.remove();
  }
});
/*---------------------------------------------------inicio-----------------------------------*/
//parsear(txt);
