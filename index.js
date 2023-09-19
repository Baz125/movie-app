const mongoose = require("mongoose");
const Models = require("./models.js");
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
const Users = Models.User;

/**
 * Establishes a connection to MongoDB using the mongoose library.
 *
 * @function
 * @name connectToDatabase
 */

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/**
 * @requires express
 */
const express = require("express");


/**
 * @requires morgan
 */
const morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  bodyParser = require("body-parser");

  /**
   * Uses express server
   */
const app = express();

/**
 * List of allowed CORS origins
 * @requires cors
 * @constant
 * @name allowedOrigins
 * @type {Array}
 */
const cors = require("cors");
let allowedOrigins = [
  "http://localhost:1234",
  "http://testsite.com",
  "https://baz125myflix.netlify.app",
  "http://localhost:4200",
  "https://baz125.github.io"
];

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


/**
 * Passport is required for authentication.
 * 
 * @requires passport 
 */
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


/**
 * Retrieves a list of all movies.
 *
 * @function
 * @name getAllMovies
 * @param {string} - The endpoint for retrieving movies.
 * @param {function} - Passport JWT authentication middleware.
 * @param {function} - Request and response handlers.
 */
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

/**
 * Retrieves data about a single movie by title.
 *
 * @function
 * @name getMovieByTitle
 * @param {string} - The endpoint for retrieving a movie by title.
 * @param {function} - Passport JWT authentication middleware.
 * @param {function} - Request and response handlers.
 */
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

/**
 * Retrieves data about a single user by username.
 *
 * @function
 * @name getUserByUsername
 * @param {string} - The endpoint for retrieving a user by username.
 * @param {function} - Passport JWT authentication middleware.
 * @param {function} - Request and response handlers.
 */
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

/**
 * Retrieves a user's favorite movies.
 *
 * @function
 * @name getUserFavoriteMovies
 * @param {string} - The endpoint for retrieving a user's favorite movies.
 * @param {function} - Passport JWT authentication middleware.
 * @param {function} - Request and response handlers.
 */
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

/**
 * Retrieves data about a genre (description) by name/title (e.g., “Thriller”).
 *
 * @function
 * @name getGenreByName
 * @param {string} - The endpoint for retrieving a genre by name.
 * @param {function} - Passport JWT authentication middleware.
 * @param {function} - Request and response handlers.
 */
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

/**
 * Retrieves data about a director (bio, birth year, death year) by name.
 *
 * @function
 * @name getDirectorByName
 * @param {string} - The endpoint for retrieving a director by name.
 * @param {function} - Passport JWT authentication middleware.
 * @param {function} - Request and response handlers.
 */
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

/**
 * Allows new users to register.
 *
 * @function
 * @name registerUser
 * @param {string} - The endpoint for user registration.
 * @param {array} - checks for username, password, and email.
 * @param {function}- Request and response handlers.
 */
app.post(
  "/users",
  [
    check("username", "Username is required, 3 character minimum").isLength({
      min: 3
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
/**
 * Allows users to update their user information by username.
 *
 * @function
 * @name updateUserByUsername
 * @param {string} - The endpoint for updating user information.
 * @param {function} - Passport JWT authentication middleware.
 * @param {function} - Request and response handlers.
 */
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $set: {
          Username: req.body.Username,
          // Password: hashedPassword,
          Email: req.body.Email,
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

/**
 * Allows users to add a movie to their list of favorite movies.
 *
 * @function
 * @name addUserFavoriteMovie
 * @param {string} - The endpoint for adding a movie to favorites.
 * @param {function} - Passport JWT authentication middleware.
 * @param {function} - Request and response handlers.
 */
app.put(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const filter = { Username: req.params.Username };

    const update = {
      $addToSet: {
        FavoriteMovies: {
          $each: [req.params.MovieID]
        }
      }
    };
    Users.updateOne(filter, update)
      .then(() => {
        return Users.findOne(filter);
      })
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        res.json(err);
      });
  }
);
//if there is a movie with that ID
//   Movies.findOne({ _id: req.params.MovieID })
//     .then((movie) => {
//       if (!movie) {
//         console.error("Movie not found");
//         return res.status(404).send("Movie not found");
//       }
//       //if the user already has that ID attached to favourites
//       Users.findOne({
//         FavouriteMovie: req.params.MovieID,
//         Username: req.params.Username
//       })
//         .then((user) => {
//           if (user) {
//             console.error("Movie already in favourites");
//             return res.status(404).send("Movie already in favourites");
//           }
//           Users.findOneAndUpdate(
//             { Username: req.params.Username },
//             { $push: { FavoriteMovies: req.params.MovieID } },
//             { new: true }
//           )
//             .then((updatedUser) => {
//               if (!updatedUser) {
//                 console.error("User not found");
//                 return res.status(404).send("User not found");
//               } else
//                 console.log("Movie added to favorites:", req.params.MovieID);
//               res.json(updatedUser);
//             })

//             .catch((err) => {
//               console.error(err);
//               res.status(500).send("Error: " + err);
//             });
//         })
//         .catch((err) => {
//           console.error(err);
//           res.status(500).send("Error: " + err);
//         });
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send("Error: " + err);
//     });

/**
 * Allows users to remove a movie from their list of favorite movies.
 *
 * @function
 * @name removeUserFavoriteMovie
 * @param {string} - The endpoint for removing a movie from favorites.
 * @param {function} - Passport JWT authentication middleware.
 * @param {function} - Request and response handlers.
 */
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

/**
 * Allows existing users to deregister.
 *
 * @function
 * @name deregisterUser
 * @param {string} - The endpoint for user deregistration.
 * @param {function} - Passport JWT authentication middleware.
 * @param {function} - Request and response handlers.
 */
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

/**
 * Retrieves information about a user by username.
 *
 * @function
 * @name getUserInfoByUsername
 * @param {string} - The endpoint for retrieving user information.
 * @param {function} - Passport JWT authentication middleware.
 * @param {function} - Request and response handlers.
 */
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
