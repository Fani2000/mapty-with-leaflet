'use strict';

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
  _setDescription = () => {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // prettier-ignore
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.#date.getMonth()]} ${this.#date.getDate()}`;
  };
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace = () => {
    this.pace = this.duration / this.distance;
    return this.pace;
  };
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
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
  #workouts = [];

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
  #validateInput = (...inputs) => {
    const validInputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));
    return validInputs;
  };
  #allPositive = (...inputs) => {
    return inputs.every(input => input > 0);
  };
  _newWorkout = ev => {
    ev.preventDefault();

    // Get Data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    const { lat, lng } = this.#mapEvent.latlng;

    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if the data is valid
      if (
        !this.#validateInput(cadence, duration, distance) ||
        !this.#allPositive(duration, distance, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      // If the workout is running, create a running object
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !this.#validateInput(elevation, duration, distance) ||
        !this.#allPositive(duration, distance)
      )
        return alert('Inputs have to be positive numbers!');

      // If the workout is cycling, create a cycling object
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    this.#workouts.push(workout);

    // Render workout on the map as marker
    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);
  };
  _renderWorkoutMarker = workout => {
    L.marker(workout.coords, {
      riseOnHover: true,
      icon: L.icon({
        iconUrl: `./${workout.type}.png`,
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
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();

    inputDistance.value = inputCadence.value = inputDuration.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  };

  _renderWorkout = workout => {
    let html = `
         <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍' : '🚴‍♀️'
            }️<span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workout.type === 'running') {
      html += `<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace.toFixed(1)}</span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadence}</span>
    <span class="workout__unit">spm</span>
  </div>
</li>`;
    }
    if (workout.type === 'cycling') {
      html += `<div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(2)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevation}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  };
}

const app = new App();
