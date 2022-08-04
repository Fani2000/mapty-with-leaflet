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

class Workout {
  #date = new Date();
  #id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace = () => {
    this.pace = this.duration / this.distance;
    return this.pace;
  };
}
class Cycling extends Workout {
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
  }
  calcSpeed = () => {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  };
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 1988);

class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
    inputType.addEventListener('change', this._toggleElevationField);
    form.addEventListener('submit', this._newWorkout);
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap, err => {
        alert(
          "Couldn't get your position, Please allow the browser to get your location!"
        );
      });
    else {
      alert("Your browser doesn't support the geolocation");
    }
  }
  _loadMap = pos => {
    const {
      coords: { latitude: lat, longitude: lng },
    } = pos;
    //   console.log(lat, lng);
    console.log(`https://www.google.com/maps/@${lat},${lng}`);

    this.#map = L.map('map', {
      center: [lat, lng],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.#map);

    L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: './home.png',
        iconSize: [24, 24],
      }),
    })
      .addTo(this.#map)
      .bindPopup('Your home!')
      .openPopup();

    this.#map.on('click', this._showForm);
  };
  _showForm = e => {
    form.classList.remove('hidden');
    inputDistance.focus();
    this.#mapEvent = e;
  };
  _toggleElevationField = e => {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  };
  _newWorkout = ev => {
    ev.preventDefault();

    console.log(
      inputType.value,
      inputDistance.value,
      inputCadence.value,
      inputDuration.value
    );

    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng], {
      riseOnHover: true,
      icon: L.icon({
        iconUrl: `./${inputType.value}.png`,
        iconSize: [24, 24],
      }),
    })
      .addTo(this.#map)
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
  };
}

const app = new App();
