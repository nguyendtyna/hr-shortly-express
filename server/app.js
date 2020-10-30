const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


// routes to home page
app.get('/',
  (req, res) => {
    res.render('index');
  });

// routes to shortly url creator
app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.get('/login', (req, res, next) => {
  res.render('login');
});

app.get('/signup', (req, res, next) => {
  res.render('signup');
});

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
          //is baseUrl client's URL?
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/login', (req, res) => {
  // use model user compare method ==> (attempted, password, salt)
});

app.post('/signup', (req, res, next) => {
  // use model user create method ==> (user obj = username, password)
  // console.log("REQ BODY USERNAME:", req.body.username);
  // console.log("REQ BODY PASSWORD:", req.body.password);
  var username = req.body.username;
  var password = req.body.password;

  return models.Users.get({ username })
    .then((userData) => {
      // if (userData) {
      //   throw error;
      // }
      return models.Users.create({
        username: username,
        password: password
      })
        .then(user => {
          res.redirect('/');
        });
    })
    .error(error => {
      res.status(400).redirect('/signup');
    })
    .catch(user => {
      res.status(200).redirect('/');
    });
});

/*
POST /signup => establishing identity, storing username and pw
user inputs username and password
server using those inputs to create a profile
send user back to home page
==> see the home page with all links + shorten

POST/login => verifying identity, compare pw, use salt/ hashing function
*/

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
