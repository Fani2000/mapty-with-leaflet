'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const mapContainer = document.getElementById('map');

let map;

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    pos => {
      const {
        coords: { latitude: lat, longitude: lng },
      } = pos;
      //   console.log(lat, lng);
      console.log(`https://www.google.com/maps/@${lat},${lng}`);

      map = L.map('map', {
        center: [lat, lng],
        zoom: 13,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup('This is your locations!')
        .openPopup();

      map.on('click', e => {
        const { lat, lng } = e.latlng;
        L.marker([lat, lng]).addTo(map);
      });
    },
    err => {
      alert(
        "Couldn't get your position, Please allow the browser to get your location!"
      );
    }
  );
else {
  alert("Your browser doesn't support the geolocation");
}
