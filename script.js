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

let map, mapEvent;

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
        form.classList.remove('hidden');
        inputDistance.focus();
        mapEvent = e;
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

inputType.addEventListener('change', e => {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});

form.addEventListener('submit', ev => {
  ev.preventDefault();

  console.log(
    inputType.value,
    inputDistance.value,
    inputCadence.value,
    inputDuration.value
  );

  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng], { riseOnHover: true })
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${inputType.value}-popup`,
      })
    )
    .setPopupContent('Workout')
    .openPopup();

  inputDistance.value = inputCadence.value = inputDuration.value = '';
  form.classList.add('hidden');
});
