const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

let topMovies = [
  {
    title: 'Interstellar',
    director: 'Christopher Nolan'
  },  
  {
    title: 'The Last of the Mohicans',
    director: 'Michael Mann'
  },
  {
    title: 'Sean of the Dead',
    director: 'Edgar Wright'
  }
];

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'),{flags: 'a'})

app.use(morgan('common', {stream: accessLogStream}));

app.use(express.static('public'));

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/', (req, res) => {
  res.send('Welcome to the MyFlix movies API!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});