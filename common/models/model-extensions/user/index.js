module.exports = function(User){
    require('./confirm')(User);
    require('./inititate-reset-password')(User);
    require('./change-password-with-otp')(User);
}
