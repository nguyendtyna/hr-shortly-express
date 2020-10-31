const parseCookies = (req, res, next) => {
  var cookies = req.headers.cookie;
  var cookiesObj = {};

  if (cookies !== undefined) {
    var individualCookies = cookies.split('; ');
    individualCookies.forEach(indCookie => {
      var array = indCookie.split('=');
      cookiesObj[array[0]] = array[1];
    });
  }
  req.cookies = cookiesObj;
  next();
};

/*
access cookies on incoming request (req)
parse the cookies into an object
assign the object to a cookies property on the req

INPUT:
'shortlyid=18ea4fb6ab3178092ce936c591ddbb90c99c9f66; otherCookie=2a990382005bcc8b968f2b18f8f7ea490e990e78; anotherCookie=8a864482005bcc8b968f2b18f8f7ea490e577b20'

// split on ';' ==> [cookie1, cookie2, cookie3]
// split on '=' ==> [shortlyid, 18ea4fb6ab3178092ce936c591ddbb90c99c9f66]

OUTPUT:
{
  shortlyid: '18ea4fb6ab3178092ce936c591ddbb90c99c9f66',
  otherCookie: '2a990382005bcc8b968f2b18f8f7ea490e990e78',
  anotherCookie: '8a864482005bcc8b968f2b18f8f7ea490e577b20'
}

*/
module.exports = parseCookies;