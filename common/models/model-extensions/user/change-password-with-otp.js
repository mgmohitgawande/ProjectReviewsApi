module.exports = function(User){

    User['change-password-with-otp'] = function(email, otp, password, cb){
        User.findOne({where: {email : email}}, function(error, user){
            if(!user){
                let err = new Error(g.f('Email not found'));
                err.statusCode = 404;
                err.code = 'EMAIL_NOT_FOUND';
                return cb(err);
            }
            if(!user.passwordResetCodeExpiry || new Date() > new Date(user.passwordResetCodeExpiry)){
                let err = new Error(g.f('OTP Expired'));
                err.statusCode = 403;
                err.code = 'OTP_EXPIRED';
                return cb(err);
            }
            if(!user.passwordResetCode || otp !== user.passwordResetCode){
                let err = new Error(g.f('OTP Mismatch'));
                err.statusCode = 403;
                err.code = 'OTP_MISMATCH';
                return cb(err);
            }
            let updateAttributes = {password : User.hashPassword(password),
            passwordResetCode : null,
            passwordResetCodeExpiry : null};

            user.updateAttributes(updateAttributes, function(err, user){
                if(err){
                    err = new Error(g.f('Email not found'));
                    err.statusCode = 500;
                    err.code = 'INTERNAL_SERVER_ERROR';
                    return cb(err);
                }

                User.app.models.Email.send({
                    to: email,
                    from: User.app.get('emailSenderAddress'),
                    subject: 'Password reset',
                    html: 'password reset successful'
                }, function(err) {
                    if (err) {
                        err = new Error(g.f('Email not found'));
                        err.statusCode = 500;
                        err.code = 'INTERNAL_SERVER_ERROR';
                        return cb(err);
                    }
                    cb(null, {message: 'Check your email to get OTP'});
                });
            })
        })
    }

    User.remoteMethod("change-password-with-otp", {
      description: "Send biometric report",
      accepts: [
        {arg: 'email', type: 'string', required: true},
        {arg: 'otp', type: 'string', required: true},
        {arg: 'password', type: 'string', required: true}
      ],
      returns: { arg: "message", type: "html" },
      http: { path: "/change-password-with-otp", verb: "post" }
    });
}