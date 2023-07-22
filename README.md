# movie-app

This repo contains the server-side of the movie-app project.

It contains a working API but no UI, all functionality mentioned below is avilable and working via API request only.

Users can receive information on movies, directors, and genres so that they
can learn more about movies they've watched or are interested in. They can also createa profile and save their favourite moveies.

The server side is built on Node.js, Express, MongoDB and hosted on Heroku.

To get started, first register as a user per documentation.html. Then log in using /login endpoint, passing username:username and password:passwerd as x-www-form-urlencoded key value pairs to receive a valid JSON web token(JWT). Passwords will be hashed using bcrypt.

All further functionality will require a valid JWT to be passed as a Bearer Token for autorization.

documentation.html gives further information on how to interact with APIs offering the following functionality:

Essential Features
● Return a list of ALL movies to the user
● Return data (description, genre, director, image URL, whether it’s featured or not) about a
single movie by title to the user
● Return data about a genre (description) by name/title (e.g., “Thriller”)
● Return data about a director (bio, birth year, death year) by name
● Allow new users to register
● Allow users to update their user info (username, password, email, date of birth)
● Allow users to add a movie to their list of favorites
● Allow users to remove a movie from their list of favorites
● Allow existing users to deregister
