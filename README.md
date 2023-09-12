# Movie App API

Welcome to Movie App Server-Side. This fully functioanl RESTful API provides users with access to information about movies, directors, and genres. Users can sign up, update their personal information, and create a list of their favorite movies. This project demonstrates full-stack JavaScript development expertise using the MERN (MongoDB, Express, React, and Node.js) stack.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Endpoints](#endpoints)
- [Authentication](#authentication)
- [Data Validation](#data-validation)
- [Data Secutiry](#data-security)
- [Testing](#testing)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

1. Return a list of ALL movies to the user.
2. Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user.
3. Return data about a genre (description) by name/title (e.g., “Thriller”).
4. Return data about a director (bio, birth year, death year) by name.
5. Allow new users to register.
6. Allow users to update their user info (username, password, email, date of birth).
7. Allow users to add a movie to their list of favorites.
8. Allow users to remove a movie from their list of favorites.
9. Allow existing users to deregister.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- Heroku for deployment
- CORS
- Passport
- Express Validator
- Postman

## Endpoints

The API provides the following endpoints:

- `GET /movies` - Returns a list of all movies.
- `GET /movies/:title` - Returns data about a single movie by title.
- `GET /genres/:name` - Returns data about a genre by name.
- `GET /directors/:name` - Returns data about a director by name.
- `POST /users` - Allows new users to register.
- `PUT /users/:username` - Allows users to update their user info.
- `POST /users/:username/movies/:movieID` - Allows users to add a movie to their list of favorites.
- `DELETE /users/:username/movies/:movieID` - Allows users to remove a movie from their list of favorites.
- `DELETE /users/:username` - Allows existing users to deregister.

### Authentication

Passport is used to implement basic HTTP authentication for login. Json Web Tokens are then used for subsequent requests.

### Data Validation

Data sent to the API is validated to ensure its integrity and security, using Express Validator

### Data Security

Passwords are hashed and salted using bcrypt and only hashed passwords are stored.
Environment variables are used to secure 3-party vendors.

### Testing

The API has been thoroughly tested using Postman to ensure its functionality.

### Documentation

Full API documentation is available in this repo at public/documentation.html

### Deployment

The API is deployed to Heroku and is accessible at https://moviedb125.herokuapp.com/.
Front-end built with React: https://baz125myflix.netlify.app/
Front-end build with Angular: https://baz125.github.io/WatchList_Angular_Client/welcome

## Contributing

Contributions are welcome! Feel free to open issues and submit pull requests to help improve this project.


