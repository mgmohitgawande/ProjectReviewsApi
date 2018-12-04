'use strict';

var loopbackPassport = require('loopback-component-passport');

let config = require('../../providers.json');

// Build the providers/passport config
config = (config || {});
module.exports = function(app) {
  var PassportConfigurator = loopbackPassport.PassportConfigurator;
  var passportConfigurator = new PassportConfigurator(app);

  passportConfigurator.init();

  passportConfigurator.setupModels({
    userModel: app.models.user,
    userIdentityModel: app.models.UserIdentity,
    userCredentialModel: app.models.UserCredential,
  });

  for (let s in config) {
    var c = config[s];
    c.session = c.session !== false;
    passportConfigurator.configureProvider(s, c);
  }

  app.get('/auth/account', (req, res, next) => {
    let cookie = req.headers.cookie;
    let cookieMap = {};
    cookie.split('; ')
      .forEach(val => cookieMap[val.split('=')[0]] = val.split('=')[1]);
    let AccessToken = app.models['AccessToken'];
    AccessToken.findById(cookieMap.access_token, (error, data) => {
      if (error) return res.error(error);
      res.send(data);
    });
  });

  app.get('/local', function(req, res, next) {
    res.render('pages/local', {
      user: req.user,
      url: req.url,
      messages: {},
    });
  });

  app.get('/ldap', function(req, res, next) {
    res.render('pages/ldap', {
      user: req.user,
      url: req.url,
      messages: {},
    });
  });

  app.get('/signup', function(req, res, next) {
    res.render('pages/signup', {
      user: req.user,
      url: req.url,
      messages: {},
    });
  });

  app.post('/signup', function(req, res, next) {
    var User = app.models.user;

    var newUser = {};
    newUser.email = req.body.email.toLowerCase();
    newUser.username = req.body.username.trim();
    newUser.password = req.body.password;

    User.create(newUser, function(err, user) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      } else {
          // Passport exposes a login() function on req (also aliased as logIn())
          // that can be used to establish a login session. This function is
          // primarily used when users sign up, during which req.login() can
          // be invoked to log in the newly registered user.
        req.login(user, function(err, user) {
          if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
          }
          return res.redirect('/auth/account');
        });
      }
    });
  });

  app.get('/login', function(req, res, next) {
    res.render('pages/login', {
      user: req.user,
      url: req.url,
      messages: {},
    });
  });

  app.get('/auth/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
  });
};
