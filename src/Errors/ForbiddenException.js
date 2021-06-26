module.exports = function ForbiddenException ( ) {
    this.message = 'inactive_authentication_failure';
    this.status  = 403;
}