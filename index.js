const mongoose = require('mongoose');
const Models = require('./models');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/movieDB',  {useNewUrlParser: true, useUnifiedTopology: true });
const express = require('express');
const  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'),{flags: 'a'})
app.use(bodyParser.json());
app.use(morgan('common', {stream: accessLogStream}));
app.use(express.static('public'));

//Working
// Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
  Movies.find()
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
 });

//  Return data about a single movie by title to the user
app.get('/movies/:title', (req, res) => {
 Movies.findOne({ Title: req.params.title})
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);  
  }); 
});

// not yet working - response in not error from .catch but from 
// Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get('/movies/genre/:Name', (req, res) => {
  Movies.findOne({ "Genre.Name" : req.params.Name })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// not yet working
// Return data about a director (bio, birth year, death year) by name;
app.get('/movies/director/:Name', (req, res) => {
  Movies.findOne({ "Director.Name" :req.params.Name})
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) =>{
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Allow new users to register;
app.post('/users',  (req, res) => {
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else {
      Users
        .create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
        .then ((user) => {res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

// Allow users to update their user full info by username;
app.put('/users/:username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true },
  ) 
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


//Allow uesrs to add a move to their favourites
app.put('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $push: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        console.error('User not found');
        return res.status(404).send('User not found');
      } else {
      console.log('Movie added to favorites:', req.params.MovieID);
      res.json(updatedUser);
    }})
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



// Allow users to remove a movie from their list of favorites;
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username }, 
    {$pull: { FavoriteMovies: req.params.MovieID  }},
    {new: true },
  )
    .then((updatedUser) => {
      console.log('Movie with the following ID was deleted from favourites: ', req.params.MovieID);
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Allow existing users to deregister (showing only a text that a user email has been removed—more on this later).
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Allow users to get information about a user
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

// let movies = [
//   {
//     title: 'Interstellar',
//     director: {
//       name: 'Christopher Nolan',
//       birthYear: '1970'
//     },
//     genre: 'SciFi',
//     description: `A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.`,
//     imageURL: 'https://posters.movieposterdb.com/15_03/2014/816692/l_816692_284eb9d5.jpg'
//   },  
//   {
//     title: 'The Last of the Mohicans',
//     director: {
//       name: 'Michael Mann',
//       birthYear: '1943'
//     },
//     genre: 'Historical',
//     description: 'Three trappers protect the daughters of a British Colonel in the midst of the French and Indian War.',
//     imageURL: 'https://posters.movieposterdb.com/12_05/1992/104691/l_104691_746b6d56.jpg'
//   },
//   {
//     title: 'Shaun of the Dead',
//     director: {
//       name: 'Edgar Wright',
//       birthYear: '1974'
//     },
//     genre: 'Comedy',
//     description: 'The uneventful, aimless lives of a London electronics salesman and his layabout roommate are disrupted by the zombie apocalypse.',
//     imageURL: 'https://posters.movieposterdb.com/05_08/2004/0365748/l_47636_0365748_26fdd550.jpg'
//   },
//   {
//     title: 'The Departed',
//     director: {
//       name: 'Martin Scorsese',
//       birthYear: '1942'
//     },
//     genre: 'Crime',
//     description: 'An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.',
//     imageURL: 'https://posters.movieposterdb.com/06_10/2006/0407887/l_138581_0407887_3f7c779a.jpg'
//   },
//   {
//     title: 'Star Wars: Revenge of the Sith',
//     director: {
//       name: 'George Lucas',
//       birthYear: '1944'
//     },
//     genre: 'Fantasy',
//     description: 'Three years into the Clone Wars, the Jedi rescue Palpatine from Count Dooku. As Obi-Wan pursues a new threat, Anakin acts as a double agent between the Jedi Council and Palpatine and is lured into a sinister plan to rule the galaxy.',
//     imageURL: 'https://posters.movieposterdb.com/12_04/2005/121766/l_121766_0ba97f41.jpg'
//   }
// ];