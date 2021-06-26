module.exports = function UserAuthenticationFailedExcpection ( ) {
    this.message = 'authentication_failure';
    this.status  = 401;
}