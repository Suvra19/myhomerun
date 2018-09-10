const users = require('../controllers/user.server.controller');
const helper = require('../utilities/helper');
const basepath = '/api/v1';

module.exports = function (app) {
    app.route(basepath + '/users/:id')
        .get(users.read)
        .put(helper.authMiddleware, users.verifyAccountOwnership, users.update)
        .delete(helper.authMiddleware, users.verifyAccountOwnership, users.delete);
    app.route(basepath + '/users').post(users.create);
    app.route(basepath + '/users/login').post(users.login);
    app.route(basepath + '/users/logout').post(helper.authMiddleware, users.logout);
};