const express = require('express'),
    bodyParser = require('body-parser');

module.exports = function () {
    const app = express();
    app.use(bodyParser.urlencoded({
        extended : true
    }));
    app.use(bodyParser.json());
    require('../app/routes/user.server.route.js')(app);
    require('../app/routes/project.server.route.js')(app);
    return app;
};