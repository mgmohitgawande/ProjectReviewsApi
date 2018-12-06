var config = require('../../server/config.json');
var path = require('path');

module.exports = function(User) {
  var senderAddress = config.emailSenderAddress; //Replace this address with your actual address
  require('./model-extensions/user')(User);

  // Custom verify email generation method
  function generateVerificationToken(user, options, cb){
    cb(null, Math.floor(1000 + Math.random() * 8999))
  }

  // Custom verify email template method
  function templateFn(verifyOptions, options, cb){
    cb(null, verifyOptions.user.verificationToken)
  }

  // Cusomizing default verify option to take control over User.verify method
  User.getVerifyOptions = function() {
    const defaultOptions = {
      type: 'email',
      from: senderAddress,
      subject: 'Re-verification Email',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '',
      host: "mywebsite.com",
      port: 80,
      generateVerificationToken: generateVerificationToken,
      templateFn: templateFn
    };
    return Object.assign({}, this.settings.verifyOptions || defaultOptions);
  };

  //send verification email after registration
  User.afterRemote('create', function(context, user, next) {
    var options = {
      type: 'email',
      to: user.email,
      from: senderAddress,
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/pages/verify.ejs'),
      redirect: '/verified',
      user: user,
      generateVerificationToken: generateVerificationToken,
      templateFn: templateFn
    };

    user.verify(options, function(err, response) {
      if (err) {
        User.deleteById(user.id);
        return next(err);
      }
      next()
    });
  });
};