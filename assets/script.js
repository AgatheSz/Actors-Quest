import API_KEY from "../config.js";

/**
 * VARIABLES
 **/

const searchBtn = document.querySelector('button');
const searchInput = document.getElementById('search-bar');
const searchResultDiv = document.getElementById('search-result');
const searchHistoryDiv = document.getElementById('search-history');
const detailsDiv = document.getElementById('person-details');
const ulMovies = document.querySelector('#movies-and-tv>ul:first-child');
const ulTv = document.querySelector('#movies-and-tv>ul:last-child');

/**
 * FONCTIONS 
 **/

function createElt(elt, parentElt, text) {
  const newElt = document.createElement(elt);
  newElt.textContent = text;
  parentElt.appendChild(newElt);

  return newElt;
}

function parseBirthDate(birthday) {
  // yyyy-mm-dd
  const birthDate = new Date(birthday);
  birthday = birthDate.toLocaleString('default', { day: '2-digit', month: 'long', year: 'numeric' });

  return birthday;
}

function createResultCard(data) {
  const resultCard = document.createElement('div');
  searchResultDiv.appendChild(resultCard);
  resultCard.className = 'result-card';

  const newImg = new Image();
  if (!data.profile_path) {
    newImg.src = "./assets/img/default.jpg";
  } else {
    newImg.src = `https://image.tmdb.org/t/p/w200${data.profile_path}`;
  }
  resultCard.appendChild(newImg);

  createElt('p', resultCard, data.name);

  resultCard.addEventListener('click', () => {
    fetchPersonDetails(data.id);
    fetchMovies(data.id);
    fetchTvShows(data.id);
  });
}

function restoreDivs() {
  const photoIdentityDiv = createElt('div', detailsDiv, '');
  photoIdentityDiv.id = "photo-identity";
  const identityDiv = createElt('div', photoIdentityDiv, '');
  identityDiv.id = "identity";

  return [photoIdentityDiv, identityDiv];
}

function displaySearchResults(data) {
  searchResultDiv.textContent = "";
  for (let i = 0; i < data.results.length; i++) {
    const person = data.results[i];
    createResultCard(person);
  }
}

function displayDetails(data) {
  detailsDiv.textContent = "";

  const [photoIdentityDiv, identityDiv] = restoreDivs();

  const newImg = new Image();
  if (!data.profile_path) {
    newImg.src = "./assets/img/default.jpg";
  } else {
    newImg.src = `https://image.tmdb.org/t/p/w300${data.profile_path}`;
  }
  photoIdentityDiv.appendChild(newImg);

  createElt('h2', identityDiv, data.name);
  createElt('p', identityDiv, parseBirthDate(data.birthday));
  createElt('p', identityDiv, data.place_of_birth);
  createElt('p', detailsDiv, data.biography);
}

function displayMovies(data) {
  const movieData = data.cast;
  ulMovies.textContent = "";
  createElt('h2', ulMovies, "Films");
  for (let i = 0; i < movieData.length; i++) {
    const movie = movieData[i];
    createElt('li', ulMovies, movie.title);
  }
}

function displayTvShows(data) {
  const tvData = data.cast;
  ulTv.textContent = "";
  createElt('h2', ulTv, "Séries télévisées");
  for (let i = 0; i < tvData.length; i++) {
    const tvShow = tvData[i];
    createElt('li', ulTv, tvShow.name);
  }
}

function fetchPerson(searchTerm) {
  fetch(`https://api.themoviedb.org/3/search/person?query=${searchTerm}&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((personData) => {
          displaySearchResults(personData);
        });
    });
}

function fetchPersonDetails(id) {
  fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${API_KEY}&language=fr-FR`)
    .then((response) => {
      response.json()
        .then((personData) => {
          displayDetails(personData);
        });
    });
}

function fetchMovies(id) {
  fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?language=fr-FR&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((movieData) => {
          displayMovies(movieData);
        });
    });
}

function fetchTvShows(id) {
  fetch(`https://api.themoviedb.org/3/person/${id}/tv_credits?language=fr-FR&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((tvData) => {
          displayTvShows(tvData);
        });
    });
}

/**
 * MAIN SCRIPT
 **/

searchBtn.addEventListener('click', () => {
  fetchPerson(searchInput.value);
});