/**
 * Passport authentication configuration.
 * @module passportConfig
 */
const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");
let bcrypt = require("bcrypt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/**
 * Configures the LocalStrategy for username and password authentication.
 * @function
 * @name configureLocalStrategy
 * @memberof module:passportConfig
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "username", // username relates to the key in postman
      passwordField: "password"
    },
    (username, password, callback) => {
      console.log(username + " " + password);
      Users.findOne({ Username: username })
        .then((user) => {
          if (!user)
            return callback(null, false, {
              message: "Incorrect username or password."
            });
          bcrypt
            .compare(password, user.Password)
            .then((isPasswordEqual) => {
              if (isPasswordEqual) {
                console.log("finished");
                return callback(null, user);
              } else {
                return callback(null, false, {
                  message: "Incorrect username or password."
                });
              }
            })
            .catch((error) => {
              console.log(error);
              return callback(error);
            });
        })
        .catch((error) => {
          console.log(error);
          return callback(error);
        });
    }
  )
);

/**
 * Configures the JWTStrategy for token-based authentication.
 * @function
 * @name configureJWTStrategy
 * @memberof module:passportConfig
 */
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret"
    },
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
