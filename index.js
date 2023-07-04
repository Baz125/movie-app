const mongoose = require("mongoose");
const Models = require("./models.js");
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const express = require("express");
const morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  bodyParser = require("body-parser");

const app = express();

// CORS
const cors = require("cors");
let allowedOrigins = ["http://localhost:1234", "http://testsite.com"];
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("check origin", origin, allowedOrigins);
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn't allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    }
  })
);

const passport = require("passport");
require("./passport");
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a"
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("common", { stream: accessLogStream }));
app.use(express.static("public"));

// Auth router - needs to be after cors and body parse (basically after all middlwares)
auth = require("./auth")(app);

// Return a list of ALL movies to the user
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//  Return data about a single movie by title to the user
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//  Return data about a single user by title to the user
app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Return a users favorite movies
app.get(
  "/users/:username/favoritemovies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.username })
      .then((user) => {
        res.json(user.FavoriteMovies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get(
  "/movies/genre/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.name })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Return data about a director (bio, birth year, death year) by name;
app.get(
  "/movies/director/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.name })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Allow new users to register;
app.post(
  "/users",
  [
    check("username", "Username is required, 5 character minimum").isLength({
      min: 5
    }),
    check(
      "username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid").isEmail()
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ Username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + " already exists");
        } else {
          Users.create({
            Username: req.body.username,
            Password: hashedPassword,
            Email: req.body.email,
            Birthday: req.body.birthday
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Allow users to update their user full info by username;
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $set: {
          Username: req.body.username,
          Password: hashedPassword,
          Email: req.body.email,
          Birthday: req.body.Birthday
        }
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Allow uesrs to add a movie to their favourites
app.put(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //if there is a movie with that ID
    Movies.findOne({ _id: req.params.MovieID })
      .then((movie) => {
        if (!movie) {
          console.error("Movie not found");
          return res.status(404).send("Movie not found");
        }
        //if the user already has that ID attached to favourites
        Users.findOne({
          FavouriteMovie: req.params.MovieID,
          Username: req.params.Username
        })
          .then((user) => {
            if (user) {
              console.error("Movie already in favourites");
              return res.status(404).send("Movie already in favourites");
            }
            Users.findOneAndUpdate(
              { Username: req.params.Username },
              { $push: { FavoriteMovies: req.params.MovieID } },
              { new: true }
            )
              .then((updatedUser) => {
                if (!updatedUser) {
                  console.error("User not found");
                  return res.status(404).send("User not found");
                } else
                  console.log("Movie added to favorites:", req.params.MovieID);
                res.json(updatedUser);
              })

              .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
              });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
          });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Allow users to remove a movie from their list of favorites;
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((updatedUser) => {
        console.log(
          "Movie with the following ID was deleted from favourites: ",
          req.params.MovieID
        );
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Allow existing users to deregister (showing only a text that a user email has been removed—more on this later).
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Allow users to get information about a user
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
