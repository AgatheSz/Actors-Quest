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

function createResultCard(data, parentElt) {
  const resultCard = document.createElement('div');
  parentElt.appendChild(resultCard);
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
    saveSearchHistory(data.name, data.profile_path, data.id);
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
    createResultCard(person, searchResultDiv);
  }
}

function saveSearchHistory(name, profile_path, id) {
  let peopleArr = sessionStorage.getItem("people");
  if (!peopleArr) {
    peopleArr = [];
  } else {
    peopleArr = JSON.parse(peopleArr);

    peopleArr = peopleArr.filter((person) => {
      return person.name !== name;
    });
  }

  const person = { 'id': id, 'name': name, 'profile_path': profile_path };
  if (peopleArr.length >= 3) {
    peopleArr.pop();
  }

  peopleArr.unshift(person);
  sessionStorage.setItem("people", JSON.stringify(peopleArr));

  handleHistory()
}

function handleHistory() {
  searchHistoryDiv.textContent = "";
  createElt('h2', searchHistoryDiv, 'Historique');

  let searchHistory = JSON.parse(sessionStorage.getItem("people"));

  if (searchHistory) {
    for (let i = 0; i < searchHistory.length; i++) {
      createResultCard(searchHistory[i], searchHistoryDiv);
    }
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
    const newLi = createElt('li', ulMovies, movie.title);

    newLi.addEventListener('click', () => {
      fetchMovieCredits(movie.id);
    })
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

function displayMovieActors(data) {
  const movieCreditsData = data.cast;
  searchResultDiv.textContent = "";

  for (let i = 0; i < movieCreditsData.length; i++) {
    const person = movieCreditsData[i];
    createResultCard(person, searchResultDiv);
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

function fetchPersonDetails(personId) {
  fetch(`https://api.themoviedb.org/3/person/${personId}?api_key=${API_KEY}&language=fr-FR`)
    .then((response) => {
      response.json()
        .then((personData) => {
          displayDetails(personData);
        });
    });
}

function fetchMovies(personId) {
  fetch(`https://api.themoviedb.org/3/person/${personId}/movie_credits?language=fr-FR&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((movieData) => {
          displayMovies(movieData);
        });
    });
}

function fetchTvShows(personId) {
  fetch(`https://api.themoviedb.org/3/person/${personId}/tv_credits?language=fr-FR&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((tvData) => {
          displayTvShows(tvData);
        });
    });
}

function fetchMovieCredits(movieId) {
  fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=fr-FR&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((creditsData) => {
          displayMovieActors(creditsData);
        });
    });
}




/**
 * MAIN SCRIPT
 **/

searchBtn.addEventListener('click', () => {
  fetchPerson(searchInput.value);
});

handleHistory();