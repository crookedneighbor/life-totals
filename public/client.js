// client-side js
// run by the browser each time your view template referencing it is loaded

const params = new URLSearchParams(window.location.search);
const gameId = params.get("game-id");
const playerName = params.get("player-name");
const startJoinContainer = document.getElementById("start-or-join-container");
const gameContainer = document.getElementById("game-container");
const startButton = document.getElementById("start-game");
const joinButton = document.getElementById("join-game");
const joinInput = document.getElementById("join-id");
const addPlayerButton = document.getElementById("add-player");
const lifeTotals = document.getElementById("life-totals");

const players = {}

const loader = document.getElementById("loader");

const yourLife = document.getElementById("your-life-total");

function displayGame() {
  startJoinContainer.classList.add("is-hidden");
  gameContainer.classList.remove("is-hidden");
  loader.classList.add('is-hidden')
}

function createPlayer (name, life, color) {
  const el = document.createElement("div");
            el.innerHTML = `
<div class="name"></div>
<div class="points"></div>
<div class="counter-button plus"><span>+</span></div>
<div class="counter-button minus"><span>-</span></div>
`;
            el.classList.add("life-total");
            el.style.background = color
            el.querySelector(".name").innerText = name;

            el.setAttribute("data-player-name", name);
            el.querySelector(".plus").addEventListener(
              "click",
              createLifeHandler(el, true)
            );
            el.querySelector(".minus").addEventListener(
              "click",
              createLifeHandler(el, false)
            );
            lifeTotals.appendChild(el);
          }
  const player = {
    name,
    color,
    el,
    updateInProgress: false,
    life: life || 0,
    
    addLife() {
      player.life++
    },
    subtractLife() {
      player.life--
    },
    update() {
      
    }
  }
  
  return player
}

function createLifeHandler(el, increment) {
  const lifePointsContainer = el.querySelector(".points");
  const name = el.getAttribute("data-player-name")

  return function(e) {
    clearTimeout(players[name].timeoutRef);
    players[name].updateInProgress = true
    
    if (increment) {
      players[name].addLife()
    } else {
      players[name].subtractLife()
    }
    lifePointsContainer.innerText = players[name].life
    
    players[name].timeoutRef = setTimeout(function() {
      fetch(
        `/game-state/${joinInput.value}/update-player/${name}`,
        {
          method: "POST",
          body: JSON.stringify({
            life: players[name].life
          }),
          headers: { "Content-Type": "application/json" }
        }
      ).then(res => res.json()).then(response => {
        players[name].updateInProgress = false
      });
    }, 1000);
  };
}

function start() {
  document.getElementById("your-name").classList.add("is-hidden");

  const ref = setInterval(() => {
    fetch("/game-state/" + joinInput.value)
      .then(res => res.json())
      .then(response => {
        console.log(response);
        if (!response.success) {
          console.error("something went really wrong");
          clearInterval(ref);
          return;
        }

        response.players.forEach(({ name, life, color }) => {
          if (!players[name]) {
            players[name] = createPlayer(name, life, color)
          }
          
          loader.classList.add("is-hidden");

          life = life || 0
          if (!players[name].updateInProgress) {
            players[name].life = life
            el.querySelector(".points").innerText = life;
          }
          
          console.log("player:", name, life);
        });
      });
  }, 1000);
}

if (gameId) {
  joinInput.value = gameId;

  if (playerName) {
    fetch("/verify-player", {
      method: "POST",
      body: JSON.stringify({
        gameId,
        playerName
      }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          displayGame();
          start();
        }
      });
  } else {
    displayGame();
  }
} else {
  loader.classList.add('is-hidden')
  startJoinContainer.classList.remove('is-hidden')
}

startButton.addEventListener("click", e => {
  fetch("/start-game", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        joinInput.value = response.publicId;
        document
          .getElementById("game-code-container")
          .classList.remove("is-hidden");
        document.getElementById("public-id").innerText = response.publicId;

        displayGame();
      }
    });
});

joinButton.addEventListener("click", displayGame);

addPlayerButton.addEventListener("click", () => {
  loader.classList.remove('is-hidden')
  fetch("/join-game", {
    method: "POST",
    body: JSON.stringify({
      publicId: joinInput.value,
      name: document.getElementById("name-input").value
    }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      console.log(response);
      if (response.success) {
        
        start();
      }
    });
});
