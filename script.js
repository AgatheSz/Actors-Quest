import API_KEY from "./config.js";

/**
 * VARIABLES
 **/

const searchBtn = document.querySelector('button');
const searchInput = document.getElementById('search-bar');
const searchResultDiv = document.getElementById('search-result');

/**
 * FONCTIONS 
 **/

function createResultCard(data) {
  const resultCard = document.createElement('div');
  searchResultDiv.appendChild(resultCard);
  resultCard.className = 'result-card';

  const newImg = new Image();
  //  + lien image
  if (!data.profile_path) {
    newImg.src = "./assets/img/default.jpg"
  } else {
    newImg.src = `https://image.tmdb.org/t/p/w200${data.profile_path}`;
  }
  resultCard.appendChild(newImg);

  const newP = document.createElement('p');
  newP.textContent = data.name;
  resultCard.appendChild(newP);
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
})