const projects = require('../controllers/project.server.controller');
const helper = require('../utilities/helper');

const basepath = '/api/v1';

module.exports = function (app) {
    app.route(basepath + '/projects')
        .get(projects.list)
        .post(helper.authMiddleware, projects.create)

    app.route(basepath + '/projects/:id')
        .get(projects.read)
        .put(helper.authMiddleware, projects.checkProjectOwnership, projects.update)

    app.route(basepath + '/projects/:id/image')
        .get(projects.viewImage)
        .put(helper.authMiddleware, projects.checkProjectOwnership, projects.updateImage)

    app.route(basepath + '/projects/:id/pledge')
        .post(helper.authMiddleware, projects.pledge);

    app.route(basepath + '/projects/:id/rewards')
        .get(projects.viewRewards)
        .put(helper.authMiddleware, projects.checkProjectOwnership, projects.updateRewards);
};