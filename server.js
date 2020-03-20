// server.js
// where your node app starts

const del = require("del");
// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const uid = new (require("short-unique-id")).default();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const colors = [
  '#cd5c5c',
  '#008599',
  '#7ecd5c',
  '#655ccd',
  '#c05ccd',
  '#cd5c89',
  '#dbaf0d'
]

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);


// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
  if (!exists) {
    db.run(
      "CREATE TABLE Games (id INTEGER PRIMARY KEY AUTOINCREMENT, public_id TEXT)"
    );
    db.run(
      "CREATE TABLE Players (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT, name TEXT, life INTEGER, color TEXT)"
    );
    db.run(
      "CREATE TABLE Cards (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT, img TEXT)"
    );
    console.log("New tables, Games, Player, Card created!");

    // insert default dreams
    db.serialize(() => {
      db.run(
        'INSERT INTO Games (public_id) VALUES ("id_1"), ("id_2"), ("id_3")'
      );
    });
  } else {
    console.log('Database "Games" ready to go!');
    /*db.each("SELECT * from Games", (err, row) => {
      if (row) {
        console.log(`game: ${row.public_id}`);
      }
    });*/
    db.each("SELECT * from Players", (err, row) => {
      if (row) {
        console.log(row);
        console.log(`player: ${row.name}`);
      }
    });
    db.each("SELECT * from Cards", (err, row) => {
      if (row) {
        console.log(`record: ${row.img}`);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// endpoint to get all the dreams in the database
app.get("/get-games", (request, response) => {
  console.log("called get dreams");
  db.all("SELECT * from Games", (err, rows) => {
    console.log(err);
    console.log(rows);
    response.send(JSON.stringify(rows));
  });
});

// endpoint to add a dream to the database
app.post("/start-game", (request, response) => {
  console.log("called start game");
  // DISALLOW_WRITE is an ENV variable that gets reset for new projects
  // so they can write to the database
  if (!process.env.DISALLOW_WRITE) {
    const publicId = uid.randomUUID(6);
    console.log("id", publicId);
    db.run(`INSERT INTO Games (public_id) VALUES (?)`, publicId, error => {
      if (error) {
        response.send({
          success: false,
          message: "Something went wrong :( :( :("
        });
      } else {
        response.send({
          success: true,
          publicId
        });
      }
    });
  }
});

app.post("/join-game", (request, response) => {
  const publicId = cleanseString(request.body.publicId);
  const playerName = cleanseString(request.body.name);
  const randomColor = Math.floor(Math.random * colors.length)
  
  console.log('random color index', randomColor)

  // DISALLOW_WRITE is an ENV variable that gets reset for new projects
  // so they can write to the database
  if (!process.env.DISALLOW_WRITE) {
    console.log("id", publicId);
    db.run(
      `INSERT INTO Players (game_id, name, life, color) VALUES (?, ?, ?, ?)`,
      publicId,
      playerName,
      40,
      color,
      error => {
        console.log(error);
        if (error) {
          response.send({
            success: false,
            message: "Something went wrong :( :( :("
          });
        } else {
          response.send({
            success: true,
            lifeTotal: 40
          });
        }
      }
    );
  }
});

app.post("/verify-player", (request, response) => {
  const gameId = cleanseString(request.body.gameId);
  const playerName = cleanseString(request.body.playerName);
  console.log(gameId);
  console.log(playerName);
  db.get(
    `SELECT * FROM Players WHERE game_id='${gameId}' and name='${playerName}'`,
    (error, row) => {
      if (error || !row) {
        response.send({
          success: false,
          message: "Something went wrong :( :( :("
        });
      } else {
        response.send({
          success: true
        });
      }
    }
  );
});

app.get("/game-state/:gameId", (request, response) => {
  const gameId = request.params.gameId;
  db.all(
    `SELECT name,life FROM Players WHERE game_id='${gameId}'`,
    (err, rows) => {
      if (err) {
        console.log(err);
        response.send({
          success: false
        });
        return;
      }

      response.send({
        success: true,
        players: rows
      });
    }
  );
});

app.post('/game-state/:gameId/update-life/:player', (request, response) => {
  const gameId = request.params.gameId
  const playerName = request.params.player
  const life = request.body.life
  
  db.run(`UPDATE Players SET life = '${life}' WHERE game_id='${gameId}' and name='${playerName}'`, error => {
    if (error) {
      console.log(error);
        response.send({
          success: false
        });
        return;
    }
    console.log('success!')
    response.send({
      success: true
    });
  })
})

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
