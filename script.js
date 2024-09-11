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
  // TODO : Changer en fonction de ce que l'API renvoie.
  const resultCard = document.createElement('div');
  searchResultDiv.appendChild(resultCard);
  resultCard.className = 'result-card';

  const newImg = new Image();
  // https://image.tmdb.org/t/p/w200 + lien image
  newImg.src = data.img;
  resultCard.appendChild(newImg);

  const newP = document.createElement('p');
  newP.textContent = data.name;
  resultCard.appendChild(newP);
}

function fetchPerson(searchTerm) {
  fetch(`https://api.themoviedb.org/3/search/person?query=${searchTerm}&api_key=${API_KEY}`)
    .then((response) => {
      response.json()
        .then((usersData) => {
          console.log(usersData);
        });
    });
}

const ayoData = { img: './assets/img/Ayo-Edebiri-Photo-Credit-Myles-Loftin-2.png', name: 'Ayo Edebiri' };
const cateData = { img: './assets/img/cate-blanchett.png', name: 'Cate Blanchett' };

/**
 * MAIN SCRIPT
 **/

createResultCard(ayoData);
createResultCard(cateData);

searchBtn.addEventListener('click', () => {
  fetchPerson(searchInput.value);
})