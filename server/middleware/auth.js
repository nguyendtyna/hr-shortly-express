const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  models.Sessions.create()
    .then(data => {
      return models.Sessions.get({id: data.insertId});
    })
    .then((currentSession) => {
      req.session = currentSession;
      return req.session;
    })
    .then(() => {
      // console.log('response body:', res);
      // console.log('res.header:', res.header);
      // use the unique hash to set a cookie in the res.header
    })
    // .error(err => {
    //   res.status(404).send(err);
    // })
    .then(() => {
      next();
    });
};

/*

test 2: sets a new cookie on the response when a session is initialized

res.cookies['shortlyid']

findOrCreateSession
- check to see if user has session (models.session.get) => returns either object or error
- if not, create session
- if so, return session id

*/

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

