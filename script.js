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
  newImg.src = data.img;
  resultCard.appendChild(newImg);

  const newP = document.createElement('p');
  newP.textContent = `${data.firstName} ${data.lastName}`;
  resultCard.appendChild(newP);
}

const ayoData = { img: './assets/Ayo-Edebiri-Photo-Credit-Myles-Loftin-2.png', firstName: 'Ayo', lastName: 'Edebiri' };

/**
 * MAIN SCRIPT
 **/

createResultCard(ayoData);