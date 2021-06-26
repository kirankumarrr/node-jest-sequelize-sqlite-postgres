module.exports = function ForbiddenException (message) {
    this.message = message || 'inactive_authentication_failure';
    this.status  = 403;
}