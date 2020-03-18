// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const uid = new (require("short-unique-id")).default();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
      "CREATE TABLE Players (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT, name TEXT)"
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
    db.each("SELECT * from Games", (err, row) => {
      if (row) {
        console.log(`record: ${row.public_id}`);
      }
    });
    db.each("SELECT * from Players", (err, row) => {
      if (row) {
        console.log(`record: ${row.name}`);
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
  const publicId = request.body.publicId;
  const name = request.body.name;
  
  console.log("called start game");
  // DISALLOW_WRITE is an ENV variable that gets reset for new projects
  // so they can write to the database
  if (!process.env.DISALLOW_WRITE) {
    console.log("id", publicId);
    db.run(`INSERT INTO Players (game_id, name) VALUES (?)`, publicId, name, error => {
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

// endpoint to clear dreams from the database
app.get("/clear-games", (request, response) => {
  console.log("called clear games");
  // DISALLOW_WRITE is an ENV variable that gets reset for new projects so you can write to the database
  if (!process.env.DISALLOW_WRITE) {
    console.log("writing");
    db.each(
      "SELECT * from Games",
      (err, row) => {
        console.log("row", row);
        db.run(`DELETE FROM Games WHERE ID=?`, row.id, error => {
          if (row) {
            console.log(`deleted row ${row.id}`);
          }
        });
      },
      err => {
        if (err) {
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
  }
});

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
