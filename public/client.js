// client-side js
// run by the browser each time your view template referencing it is loaded

console.log("hello world :o");
const startJoinContainer = document.getElementById('start-or-join-container');
const startButton = document.getElementById('start-game');
const joinButton = document.getElementById('join-game');

fetch('/get-games')

startButton.addEventListener('click', (e) => {
  fetch("/start-game", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      console.log(response)
    });
});
