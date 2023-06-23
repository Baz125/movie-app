const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");
let bcrypt = require("bcrypt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

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
          //Commenting out original code to try a change suggested by ChatGPT(below)
          //   const isPasswordEqual = bcrypt.compare(password, user.password);
          //   if (isPasswordEqual) {
          //     console.log("finished");
          //     return callback(null, user);
          //   } else {
          //     return callback(null, false, {
          //       message: "Incorrect username or password."
          //     });
          //   }
          // })
          // .catch((error) => {
          //   console.log(error);
          //   return callback(error);
          // });
          bcrypt
            .compare(password, user.password)
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
