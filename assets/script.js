import API_KEY from "../config.js";

/**
 * VARIABLES
 **/

const searchBtn = document.querySelector('button');
const searchInput = document.getElementById('search-bar');
const searchResultDiv = document.getElementById('search-result');
const paginationDiv = document.getElementById('pagination');
const searchHistoryDiv = document.getElementById('search-history');
const detailsDiv = document.getElementById('person-details');
const aside = document.querySelector('aside');
const ulMovies = document.querySelector('#movies-and-tv>ul:first-child');
const ulTv = document.querySelector('#movies-and-tv>ul:last-child');

let maxPages;

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
  const birthDate = new Date(birthday);
  birthday = birthDate.toLocaleString('default', { day: '2-digit', month: 'long', year: 'numeric' });

  return birthday;
}

function addImage(url, parentElt) {
  const newImg = new Image();
  if (!url) {
    newImg.src = "./assets/img/default.jpg";
  } else {
    newImg.src = `https://image.tmdb.org/t/p/w200${url}`;
  }
  parentElt.appendChild(newImg);
}

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
    handleFavouritesClic(data.id, data.name, data.profile_path, star);
    displayFavourites();
  });

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

// TODO: Empêcher d'aller au-dessus du nombre de pages renvoyées par la recherche
function handlePagination(page, searchTerm, maxPages) {
  paginationDiv.textContent = "";
  const buttonPageMinus = createElt('button', paginationDiv, '<');
  const currentPage = createElt('span', paginationDiv, page);
  const buttonPagePlus = createElt('button', paginationDiv, '>');

  buttonPageMinus.addEventListener('click', () => {
    if (page > 1) {
      page--;
      currentPage.innerHTML = page;
      fetchPerson(searchTerm, page);
    }
  });

  buttonPagePlus.addEventListener('click', () => {
    if (page < maxPages) {
      page++;
      currentPage.innerHTML = page;
      fetchPerson(searchTerm, page);
    }
  });
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

function drawStar(fillColor, strokeColor) {
  return `<?xml version="1.0" encoding="utf-8"?>
<svg width="50px" height="50px" viewBox="0 0 25 25" fill=${fillColor} xmlns="http://www.w3.org/2000/svg">
<path d="M13 4L15.2747 9.8691L21.5595 10.2188L16.6806 14.1959L18.2901 20.2812L13 16.87L7.70993 20.2812L9.31941 14.1959L4.44049 10.2188L10.7253 9.8691L13 4Z" 
stroke="${strokeColor}" stroke-width="0.5"/>
</svg>`
}

function displayStar(personId, star) {
  if (localStorage.getItem(personId)) {
    star.innerHTML = drawStar('#f3c023', '#f3c023');
  } else {
    star.innerHTML = drawStar('none', '#000');
  }
}

function handleFavouritesClic(personId, personName, personPath, star) {
  if (!localStorage.getItem(personId)) {
    star.innerHTML = drawStar('#f3c023', '#f3c023');
    localStorage.setItem(personId, JSON.stringify({ 'name': personName, 'profile_path': personPath }));
  } else {
    star.innerHTML = drawStar('none', '#000');
    localStorage.removeItem(personId);
  }
}

function displayFavourites() {
  aside.textContent = "";
  createElt('h2', aside, 'Liste des favoris');

  for (let i = 0; i < localStorage.length; i++) {
    const id = localStorage.key(i);
    const person = JSON.parse(localStorage.getItem(id));

    createElt('p', aside, person.name).addEventListener('click', () => {
      fetchPersonDetails(id);
      fetchMovies(id);
      fetchTvShows(id);
      saveSearchHistory(person.name, person.profile_path, id);
    });
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
      fetchMovieCredits(movie.id, movie.title);
    });
  }
}

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

function displayMovieActors(data, title) {
  const movieCreditsData = data.cast;
  searchResultDiv.textContent = "";
  createElt('h2', searchResultDiv, title);

  for (let i = 0; i < movieCreditsData.length; i++) {
    const person = movieCreditsData[i];
    createResultCard(person, searchResultDiv);
  }
}

function displayTvActors(data, name) {
  const tvCreditsData = data.cast;
  searchResultDiv.textContent = "";
  createElt('h2', searchResultDiv, name);

  for (let i = 0; i < tvCreditsData.length; i++) {
    const person = tvCreditsData[i];
    createResultCard(person, searchResultDiv);
  }
}

function fetchPerson(searchTerm, page) {
  fetch(`https://api.themoviedb.org/3/search/person?query=${searchTerm}&page=${page}&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((personData) => {
          displaySearchResults(personData);
          maxPages = personData.total_pages;
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

function fetchMovieCredits(movieId, title) {
  fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=fr-FR&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((creditsData) => {
          displayMovieActors(creditsData, title);
        });
    });
}

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
  const page = 1;
  fetchPerson(searchInput.value, page);
  setTimeout(() => { handlePagination(page, searchInput.value, maxPages); }, 10);
});

handleHistory();
displayFavourites();