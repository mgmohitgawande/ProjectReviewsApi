module.exports = function(User){

    User.confirm = function(uid, token, redirect, fn){
        fn = fn || utils.createPromiseCallback();
        this.findById(uid, function(err, user) {
          if (err) {
            fn(err);
          } else {
            if (user && user.verificationToken === token) {
              user.verificationToken = null;
              user.emailVerified = true;
              user.save(function(err) {
                if (err) {
                  fn(err);
                } else {
                  fn();
                }
              });
            } else {
              if (user) {
                err = new Error(g.f('Invalid token: %s', token));
                err.statusCode = 400;
                err.code = 'INVALID_TOKEN';
              } else {
                err = new Error(g.f('User not found: %s', uid));
                err.statusCode = 404;
                err.code = 'USER_NOT_FOUND';
              }
              fn(err);
            }
          }
        });
        return fn.promise;
    }

    User.remoteMethod("confirm", {
      description: "Send biometric report",
      accepts: [
        {arg: 'uid', type: 'string', required: true},
        {arg: 'token', type: 'string', required: true},
        {arg: 'redirect', type: 'string'},
      ],
      returns: { arg: "message", type: "html" },
      http: { path: "/confirm", verb: "post" }
    });
}