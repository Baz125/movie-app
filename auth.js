/**
 * Authentication module for handling user login and JWT token generation.
 * @module auth
 */

const jwtSecret = "your_jwt_secret";

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport.js");

/**
 * Generates a JWT token for a user.
 * @param {object} user - The user object for whom the token is generated.
 * @returns {string} JWT token for the user.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256"
  });
};

// module.exports = (router) => {
//   router.post("/login", (req, res) => {
//     passport.authenticate("local", { session: false }, (error, user, info) => {
//       if (error || !user) {
//         return res.status(400).json({
//           message: "Something is not right",
//           user: user
//         });
//       }
//       req.login(user, { session: false }, (error) => {
//         if (error) {
//           res.send(error);
//         }
//         let token = generateJWTToken(user.toJSON());
//         return res.json({ user, token });
//       });
//     })(req, res);
//   });
// };

/**
 * Defines authentication routes and logic for user login.
 * @param {object} router - Express router to define authentication routes.
 */
module.exports = (router) => {
    /**
   * Handles user login using passport local strategy.
   * @name POST /login
   * @function
   * @memberof module:auth
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.status(500).json({ message: "Internal server error" });
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
