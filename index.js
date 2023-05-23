const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

let movies = [
  {
    title: 'Interstellar',
    director: {
      name: 'Christopher Nolan',
      birthYear: '1970'
    },
    genre: 'SciFi',
    description: `A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.`,
    imageURL: 'https://posters.movieposterdb.com/15_03/2014/816692/l_816692_284eb9d5.jpg'
  },  
  {
    title: 'The Last of the Mohicans',
    director: {
      name: 'Michael Mann',
      birthYear: '1943'
    },
    genre: 'Historical',
    description: 'Three trappers protect the daughters of a British Colonel in the midst of the French and Indian War.',
    imageURL: 'https://posters.movieposterdb.com/12_05/1992/104691/l_104691_746b6d56.jpg'
  },
  {
    title: 'Shaun of the Dead',
    director: {
      name: 'Edgar Wright',
      birthYear: '1974'
    },
    genre: 'Comedy',
    description: 'The uneventful, aimless lives of a London electronics salesman and his layabout roommate are disrupted by the zombie apocalypse.',
    imageURL: 'https://posters.movieposterdb.com/05_08/2004/0365748/l_47636_0365748_26fdd550.jpg'
  },
  {
    title: 'The Departed',
    director: {
      name: 'Martin Scorsese',
      birthYear: '1942'
    },
    genre: 'Crime',
    description: 'An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.',
    imageURL: 'https://posters.movieposterdb.com/06_10/2006/0407887/l_138581_0407887_3f7c779a.jpg'
  },
  {
    title: 'Star Wars: Revenge of the Sith',
    director: {
      name: 'George Lucas',
      birthYear: '1944'
    },
    genre: 'Fantasy',
    description: 'Three years into the Clone Wars, the Jedi rescue Palpatine from Count Dooku. As Obi-Wan pursues a new threat, Anakin acts as a double agent between the Jedi Council and Palpatine and is lured into a sinister plan to rule the galaxy.',
    imageURL: 'https://posters.movieposterdb.com/12_04/2005/121766/l_121766_0ba97f41.jpg'
  }
];

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'),{flags: 'a'})
app.use(bodyParser.json());
app.use(morgan('common', {stream: accessLogStream}));
app.use(express.static('public'));

// Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
  res.json(movies);
 });

//  Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) => {
    return movie.title === req.params.title
  }));
});

// Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get('/movies/genres/:name', (req, res) => {
  res.send('Successful GET request returning data on the genre of a single movie');
});

// Return data about a director (bio, birth year, death year) by name;
app.get('/movies/directors/:name', (req, res) => {
  res.send('Successful GET request returning all data on a single director by name');
});

// Allow new users to register;
app.post('/users',  (req, res) => {
  res.send('Successful POST request adding a user')
})

// Allow users to update their user info (username);
app.put('/users/:username', (req, res) => {
  res.send(`Successful PUT request updating a user's username`);
});

// Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later);
app.post('/users/favourites/:title', (req, res) => {
  res.send(`Successful POST request adding a movie to a user's favourites`);
});

// Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed—more on this later);
app.delete('/users/favourites/:title', (req, res) => {
  res.send(`Successful DELETE request removing a movie from a user's favourites`);
});

// Allow existing users to deregister (showing only a text that a user email has been removed—more on this later).
app.delete('/users/email/:username', (req, res) => {
  res.send(`Successful DELETE request deregistering a user`);
});



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});