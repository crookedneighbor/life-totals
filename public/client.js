// client-side js
// run by the browser each time your view template referencing it is loaded

console.log("hello world :o");
const startJoinContainer = document.getElementById('start-or-join-container');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-game');
const joinButton = document.getElementById('join-game');
const joinInput = document.getElementById('join-id');

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
        document.getElementById('public-id').innerText = response.publicId;
        gameContainer.classList.remove('is-hidden');
      }
    });
});

joinButton.addEventListener('click', (e) => {
  fetch("/join-game", {
    method: "POST",
    body: JSON.stringify({
      publicId: joinInput.value
    }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        startJoinContainer.classList.add('is-hidden');
        gameContainer.classList.remove('is-hidden');
      }
    });
})