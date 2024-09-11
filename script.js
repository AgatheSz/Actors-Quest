import API_KEY from "./config.js";

/**
 * VARIABLES
 **/

const searchBtn = document.querySelector('button');
const searchInput = document.getElementById('search-bar');
const searchResultDiv = document.getElementById('search-result');
const detailsDiv = document.getElementById('person-details');

/**
 * FONCTIONS 
 **/

function createElt(elt, parentElt, text) {
  const newElt = document.createElement(elt);
  newElt.textContent = text;
  parentElt.appendChild(newElt);

  return newElt;
}

function parseBirthDate(birthDate) {

}

function createResultCard(data) {
  const resultCard = document.createElement('div');
  searchResultDiv.appendChild(resultCard);
  resultCard.className = 'result-card';

  const newImg = new Image();
  //  + lien image
  if (!data.profile_path) {
    newImg.src = "./assets/img/default.jpg";
  } else {
    newImg.src = `https://image.tmdb.org/t/p/w200${data.profile_path}`;
  }
  resultCard.appendChild(newImg);

  createElt('p', resultCard, data.name);

  resultCard.addEventListener('click', () => {
    fetchPersonDetails(data.id);
  });
}

function restoreDivs() {
  const photoIdentityDiv = createElt('div', detailsDiv, '');
  photoIdentityDiv.id = "photo-identity";
  const identityDiv = createElt('div', photoIdentityDiv, '');
  identityDiv.id = "identity";

  return [photoIdentityDiv, identityDiv];
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
  createElt('p', identityDiv, data.birthday);
  createElt('p', identityDiv, data.place_of_birth);
  createElt('p', detailsDiv, data.biography);
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

function displaySearchResults(data) {
  searchResultDiv.textContent = "";
  for (let i = 0; i < data.results.length; i++) {
    const person = data.results[i];
    createResultCard(person);
  }
}

/**
 * MAIN SCRIPT
 **/

searchBtn.addEventListener('click', () => {
  fetchPerson(searchInput.value);
});