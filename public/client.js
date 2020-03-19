// client-side js
// run by the browser each time your view template referencing it is loaded

const params = new URLSearchParams(window.location.search)
const gameId = params.get('game-id')
const playerName = params.get('player-name')
const startJoinContainer = document.getElementById('start-or-join-container');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-game');
const joinButton = document.getElementById('join-game');
const joinInput = document.getElementById('join-id');
const addPlayerButton = document.getElementById('add-player');

const yourLife = document.getElementById('your-life-total');

function displayGame () {
  startJoinContainer.classList.add('is-hidden');
  gameContainer.classList.remove('is-hidden');
}

function start () {
  document.getElementById('your-name').classList.add('is-hidden');
  
  setInterval(() => {
    
  }, 5000)
}

if (gameId) {
  joinInput.value = gameId
  
  if (playerName) {
  fetch('/verify-player', {
    method: "POST",
    body: JSON.stringify({
      gameId,
      playerName
    }),
    headers: { "Content-Type": "application/json" }
  }).then(res => res.json()).then(response => {
    if (response.success) {
      displayGame()
      start()
    }
  })
} else {
    displayGame()
}
}

startButton.addEventListener('click', (e) => {
  fetch("/start-game", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        joinInput.value = response.publicId
        document.getElementById('game-code-container').classList.remove('is-hidden')
        document.getElementById('public-id').innerText = response.publicId
        
        displayGame()
      }
    });
});

joinButton.addEventListener('click', displayGame);

addPlayerButton.addEventListener('click', () => {
  fetch("/join-game", {
    method: "POST",
    body: JSON.stringify({
      publicId: joinInput.value,
      name: document.getElementById('name-input').value
    }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
    console.log(response)
      if (response.success) {

        //yourLife.querySelector('.points').innerText = response.lifeTotal;
        //yourLife.classList.remove('is-hidden');
        displayGame();
      }
    });
})