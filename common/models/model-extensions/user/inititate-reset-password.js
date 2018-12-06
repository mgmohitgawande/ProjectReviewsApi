module.exports = function(User){

    User['inititate-reset-password'] = function(email, cb){
        User.findOne({where: {email : email}}, function(error, user){
            if(!user){
                err = new Error(g.f('Email not found'));
                err.statusCode = 404;
                err.code = 'EMAIL_NOT_FOUND';
                return cb(err);
            }
            console.log(1);
            let passwordResetCode = (Math.floor(1000 + Math.random() * 8999)).toString();
            user.passwordResetCode = passwordResetCode;
            user.passwordResetCodeExpiry = new Date(new Date().setMinutes(new Date().getMinutes() + 15));
            user.save(user, function(err, user){
                if(err){
                    err = new Error(g.f('Email not found'));
                    err.statusCode = 500;
                    err.code = 'INTERNAL_SERVER_ERROR';
                    return cb(err);
                }
                console.log(1);

                User.app.models.Email.send({
                    to: email,
                    from: User.app.get('emailSenderAddress'),
                    subject: 'Password reset',
                    html: passwordResetCode
                }, function(err) {
                    if (err) {
                        err = new Error(g.f('Email not found'));
                        err.statusCode = 500;
                        err.code = 'INTERNAL_SERVER_ERROR';
                        return cb(err);
                    }
                    console.log(11234);
                    cb(null, {message: 'Check your email to get OTP'});
                });
            })
        })
    }

    User.remoteMethod("inititate-reset-password", {
      description: "Send biometric report",
      accepts: [
        {arg: 'email', type: 'string', required: true}
      ],
      returns: { arg: "message", type: "html" },
      http: { path: "/inititate-reset-password", verb: "post" }
    });
}