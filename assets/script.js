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
const ulFav = document.querySelector('aside>ul');

/**
 * FONCTIONS 
 **/

/**
 * Crée un nouvel élement html et le place à l'endroit voulu dans la page HTML
 * @param {HTMLElement} elt - nouvel élement
 * @param {HTMLElement} parentElt - élement parent
 * @param {String} text - contenu textuel de l'élement
 * 
 * @returns {HTMLElement} - nouvel élement
 **/
function createElt(elt, parentElt, text) {
  const newElt = document.createElement(elt);
  newElt.textContent = text;
  parentElt.appendChild(newElt);

  return newElt;
}

/**
 * @param {String} birthday - date de naissance au format aaaa-mm-jj
 * 
 * @returns {Date} - date de naissance au format jj mois aaaa
 **/
function parseBirthDate(birthday) {
  const birthDate = new Date(birthday);
  birthday = birthDate.toLocaleString('default', { day: '2-digit', month: 'long', year: 'numeric' });

  return birthday;
}

/**
 * @param {String} url - URL vers image acteur
 * @param {HTMLElement} - élement parent auquel l'image va être ajoutée 
 **/
function addImage(url, parentElt) {
  const newImg = new Image();
  if (!url) {
    newImg.src = "./assets/img/default.jpg";
  } else {
    newImg.src = `https://image.tmdb.org/t/p/w200${url}`;
  }
  parentElt.appendChild(newImg);
}

/**
 * Création d'une carte présentant les informations des acteurs
 * @param {JSON} data - données de l'acteur récupérées via API
 * @param {HTMLElement} parentElt - élement parent auquel la carte de l'acteur va être ajoutée
 **/
function createResultCard(data, parentElt) {
  const resultCard = createElt('div', parentElt, "");
  resultCard.className = 'result-card';
  addImage(data.profile_path, resultCard);
  createElt('p', resultCard, data.name);

  if (data.character) {
    createElt('p', resultCard, data.character);
  }

  let star = createElt('span', resultCard, '');
  displayStar(data.id, star);

  star.addEventListener('click', () => {
    handleFavouritesClic(data.id, data.name, star);
    displayFavourites();
  });

  resultCard.addEventListener('click', () => {
    fetchPersonDetails(data.id);
    fetchMovies(data.id);
    fetchTvShows(data.id);
    saveSearchHistory(data.name, data.profile_path, data.id);
  });
}

/**
 * @returns {[HTMLElement]} 
 **/
function restoreDivs() {
  const photoIdentityDiv = createElt('div', detailsDiv, '');
  photoIdentityDiv.id = "photo-identity";
  const identityDiv = createElt('div', photoIdentityDiv, '');
  identityDiv.id = "identity";

  return [photoIdentityDiv, identityDiv];
}

/**
 * Affichage des réultats de la recherche d'acteur par nom
 * @param {JSON} data - données de l'acteur récupérées via API
 **/
function displaySearchResults(data) {
  searchResultDiv.textContent = "";
  for (let i = 0; i < data.results.length; i++) {
    const person = data.results[i];
    createResultCard(person, searchResultDiv);
  }
}

/**
 * @param {String} name - nom de l'acteur
 * @param {String} profile_path - URL photo de l'acteur
 * @param {Number} id - id de l'acteur
 **/
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

/**
 * 
 **/
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

/**
 * @param {String} fillColor - couleur de remplissage de l'étoile
 * 
 * @returns {String} SVG de l'étoile
 **/
function drawStar(fillColor, strokeColor) {
  return `<?xml version="1.0" encoding="utf-8"?>
<svg width="50px" height="50px" viewBox="0 0 25 25" fill=${fillColor} xmlns="http://www.w3.org/2000/svg">
<path d="M13 4L15.2747 9.8691L21.5595 10.2188L16.6806 14.1959L18.2901 20.2812L13 16.87L7.70993 20.2812L9.31941 14.1959L4.44049 10.2188L10.7253 9.8691L13 4Z" 
stroke=${strokeColor} stroke-width="0.5"/>
</svg>`
}

/**
 * @param {Number} personId - id de l'acteur
 * @param {String} star - étoile de favoris
 **/
function displayStar(personId, star) {
  // if (true) {
  // star.innerHTML = drawStar('#f3c023', '#f3c023');
  // } else {
  star.innerHTML = drawStar('none', '#000');
  // }
}

/**
 * @param {Number} personId - id de l'acteur
 * @param {String} personName - nom de l'acteur
 * @param {String} url - URL de la photo de l'acteur
 * @param {String} star - SVG de l'étoile
 * 
 * @returns {} 
 **/
function handleFavouritesClic(personId, personName, url, star) {
  let favourites = JSON.parse(localStorage.getItem('favourites'));

  if (!favourites[personId]) {
    favourites[personId] = { name: personName, profile_path: url };
    star.innerHTML = drawStar('#f3c023');
    localStorage.setItem('favourites', JSON.stringify(favourites));
  } else {
    star.innerHTML = drawStar('none');
    favourites = favourites.filter((personId) => {
      // objet.hasOwn()
      return
    })
  }
}

/**
 *  
 **/
function displayFavourites() {
  ulFav.textContent = "";

  for (let i = 0; i < localStorage.length; i++) {
    const id = localStorage.key(i);
    let newLi = createElt('li', ulFav, localStorage.getItem(id));

    newLi.addEventListener('click', () => {
      fetchPersonDetails(id);
      saveSearchHistory()
    });
  }
}

/**
 * @param {JSON} data - données de l'acteur récupérées via API
 **/
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

/**
 * @param {JSON} data - données des films d'un acteur spécifique récupérées via API
 **/
function displayMovies(data) {
  const movieData = data.cast;
  ulMovies.textContent = "";
  createElt('h2', ulMovies, "Films");
  for (let i = 0; i < movieData.length; i++) {
    const movie = movieData[i];
    const newLi = createElt('li', ulMovies, movie.title);

    newLi.addEventListener('click', () => {
      fetchMovieCredits(movie.id, movie.title);
    });
  }
}

/**
 * @param {JSON} data - données des séries d'un acteur spécifique récupérées via API
 **/
function displayTvShows(data) {
  const tvData = data.cast;
  ulTv.textContent = "";
  createElt('h2', ulTv, "Séries télévisées");
  for (let i = 0; i < tvData.length; i++) {
    const tvShow = tvData[i];
    const newLi = createElt('li', ulTv, tvShow.name);

    newLi.addEventListener('click', () => {
      fetchTvCredits(tvShow.id, tvShow.name);
    });
  }
}

/**
 * @param {JSON} data - données d'un film récupérées via API
 * @param {String} title - titre du film
 **/
function displayMovieActors(data, title) {
  const movieCreditsData = data.cast;
  searchResultDiv.textContent = "";
  createElt('h2', searchResultDiv, title);

  for (let i = 0; i < movieCreditsData.length; i++) {
    const person = movieCreditsData[i];
    createResultCard(person, searchResultDiv);
  }
}

/**
 * @param {JSON} data - données d'une série récupérées via API
 * @param {String} name - titre de la série
 **/
function displayTvActors(data, name) {
  const tvCreditsData = data.cast;
  searchResultDiv.textContent = "";
  createElt('h2', searchResultDiv, name);

  for (let i = 0; i < tvCreditsData.length; i++) {
    const person = tvCreditsData[i];
    createResultCard(person, searchResultDiv);
  }
}

// ------------------------------------------> Appels API <------------------------------------------

/**
 * @param {String} searchTerm - critères de recherche 
 **/
function fetchPerson(searchTerm) {
  fetch(`https://api.themoviedb.org/3/search/person?query=${searchTerm}&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((personData) => {
          displaySearchResults(personData);
        });
    });
}

/**
 * @param {Number} personId - id de l'acteur
 **/
function fetchPersonDetails(personId) {
  fetch(`https://api.themoviedb.org/3/person/${personId}?api_key=${API_KEY}&language=fr-FR`)
    .then((response) => {
      response.json()
        .then((personData) => {
          displayDetails(personData);
        });
    });
}

/**
 * @param {Number} personId - id de l'acteur
 **/
function fetchMovies(personId) {
  fetch(`https://api.themoviedb.org/3/person/${personId}/movie_credits?language=fr-FR&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((movieData) => {
          displayMovies(movieData);
        });
    });
}

/**
 * @param {Number} personId - id de l'acteur
 **/
function fetchTvShows(personId) {
  fetch(`https://api.themoviedb.org/3/person/${personId}/tv_credits?language=fr-FR&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((tvData) => {
          displayTvShows(tvData);
        });
    });
}

/**
 * @param {Number} movieId - id du film
 * @param {String} title - titre du film
 **/
function fetchMovieCredits(movieId, title) {
  fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=fr-FR&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((creditsData) => {
          displayMovieActors(creditsData, title);
        });
    });
}

/**
 * @param {Number} tvShowId - id de la série
 * @param {String} name - titre de la série
 **/
function fetchTvCredits(tvShowId, name) {
  fetch(`https://api.themoviedb.org/3/tv/${tvShowId}/credits?language=fr-FR&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((creditsData) => {
          displayTvActors(creditsData, name);
        });
    });
}

/**
 * MAIN SCRIPT
 **/

searchBtn.addEventListener('click', () => {
  fetchPerson(searchInput.value);
  searchInput.value = "";
});

handleHistory();
displayFavourites();