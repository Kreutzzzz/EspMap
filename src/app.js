

import { Loader } from '@googlemaps/js-api-loader';
import MarkerClusterer from '@google/markerclustererplus';


import { initializeApp } from "firebase/app";
import firebase from "firebase";


const firebaseConfig = {
  apiKey: "AIzaSyDk8H4v5oN9lXiJW4MTS8nmCsK0xnXtEhg",
  authDomain: "esp32-test-8d27d.firebaseapp.com",
  databaseURL: "https://esp32-test-8d27d-default-rtdb.firebaseio.com/",
  projectId: "esp32-test-8d27d",
  storageBucket: "esp32-test-8d27d.appspot.com",
  messagingSenderId: "87473881730",
  appId: "1:87473881730:web:53b982090a6f682aeeea9b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const apiOptions = {
  apiKey: "AIzaSyAzUKEvx7Mf0js8qb4nbjCAOAFUwMmHItc"
}

var poslat, poslng, tempe, umida;

const loader = new Loader(apiOptions);

var location = firebase.database().ref('base');
location.on('value',(snapshot)=>{
const data = snapshot.val();

  poslat = snapshot.val().lat;
  poslng = snapshot.val().lng;
  tempe = snapshot.val().temp;
  umida = snapshot.val().umi;

  console.log(tempe);

  loader.load().then(() => {
    console.log('Maps JS API loaded');
  
    const map = displayMap();
    const markers = addMarkers(map);
    clusterMarkers(map, markers);
    addPanToMarker(map, markers);
    getWeather(poslat,poslng, tempe, umida);
  });
})

function displayMap() {
  const mapOptions = {
    center: { lat: Number(poslat), lng: Number(poslng) },
    zoom: 10
  };
  const mapDiv = document.getElementById('map');
  return new google.maps.Map(mapDiv, mapOptions);
}


function addMarkers(map) {

  const locations = {
    reallocation: { lat: Number(poslat), lng: Number(poslng) }
  }
  console.log(locations);
  const markers = [];
  for (const location in locations) {
    const markerOptions = {
      map: map,
      position: locations[location],
      icon: './img/custom_pin.png'
    }
    const marker = new google.maps.Marker(markerOptions);
    markers.push(marker);
  }
  return markers;
}

function clusterMarkers(map, markers) {
  const clustererOptions = { imagePath: './img/m' };
  const markerCluster = new MarkerClusterer(map, markers, clustererOptions);
}

function addPanToMarker(map, markers) {
  let circle;
  markers.map(marker => {
    marker.addListener('click', event => {
      const location = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      map.panTo(location);
      if (circle) {
        circle.setMap(null);
      }
      circle = drawCircle(map, location);
    });
  });
}

function drawCircle(map, location) {
  const circleOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 1,
    map: map,
    center: location,
    radius: 800
  }
  const circle = new google.maps.Circle(circleOptions);
  return circle;
}


// SELECT ELEMENTS
const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temperature-value p");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location p");
const humidityElement = document.querySelector(".humidity");
// App data
const weather = {};

weather.temperature = {
    unit : "celsius"
}

// APP CONSTS AND VARS
const KELVIN = 273;
// API KEY
const key = "82005d27a116c2880c8f0fcb866998a0";

// GET WEATHER FROM API PROVIDER
function getWeather(latitude, longitude, tempe){
    let api = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;
    
    fetch(api)
        .then(function(response){
            let data = response.json();
            return data;
        })
        .then(function(data){
            weather.temperature.value = tempe;
            weather.description = data.weather[0].description;
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;
        })
        .then(function(){
            displayWeather();
        });
}

// DISPLAY WEATHER TO UI
function displayWeather(){
    iconElement.innerHTML = `<img src="icons/${weather.iconId}.png"/>`;
    tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
    humidityElement.innerHTML = umida+'%';
}

// C to F conversion
function celsiusToFahrenheit(temperature){
    return (temperature * 9/5) + 32;
}

// WHEN THE USER CLICKS ON THE TEMPERATURE ELEMENET
tempElement.addEventListener("click", function(){
    if(weather.temperature.value === undefined) return;
    
    if(weather.temperature.unit == "celsius"){
        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
        fahrenheit = Math.floor(fahrenheit);
        
        tempElement.innerHTML = `${fahrenheit}°<span>F</span>`;
        weather.temperature.unit = "fahrenheit";
    }else{
        tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
        weather.temperature.unit = "celsius"
    }
});
