module.exports = function UserNotFoundExpection () {
    this.message = 'user_not_found';
    this.status  = 404;
}