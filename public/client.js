// client-side js
// run by the browser each time your view template referencing it is loaded

console.log("hello world :o");
const startJoinContainer = document.getElementById('start-or-join-container');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-game');
const joinButton = document.getElementById('join-game');
const joinInput = document.getElementById('join-id');
const addPlayerButton = document.getElementById('add-player');

fetch('/get-games')

startButton.addEventListener('click', (e) => {
  fetch("/start-game", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        startJoinContainer.classList.add('is-hidden');
        joinInput.value = response.publicId;
        document.getElementById('game-code-container').classList.remove('is-hidden')
        document.getElementById('public-id').innerText = response.publicId;
        gameContainer.classList.remove('is-hidden');
      }
    });
});

joinButton.addEventListener('click', (e) => {
  startJoinContainer.classList.add('is-hidden');
  gameContainer.classList.remove('is-hidden');
});

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
        document.getElementById('your-name').classList.add('is-hidden');
        document.getElementById('your-life-total').classList.remove('is-hidden');
        startJoinContainer.classList.add('is-hidden');
        gameContainer.classList.remove('is-hidden');
      }
    });
})