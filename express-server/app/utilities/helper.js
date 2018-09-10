const bcrypt = require("bcrypt-nodejs"),
        jwt = require('jsonwebtoken');

const userModel = require('../models/user.server.model');

const jwtKey = "s3cr3t",
    authHeaderKey = 'X-Authorization';

exports.creator = "CREATOR";
exports.backer  = "BACKER";

exports.createUpdateQuery = function (columnData, tableName, pk) {
    let length = Object.keys(columnData).length;
    let counter = 0;
    let values = [];
    let operation = 'UPDATE ' + tableName + ' SET ';
    let columns = '';
    let condition = ' WHERE ' + pk + ' = ? ';
    for (data in columnData) {
        if (data === pk) {
            counter++;
        } else {
            columns += data + '=?'
            if (++counter < length) {
                columns += ', ';
            }
            values.push(columnData[data]);
        }
    }
    values.push(columnData[pk]);
    return { "query" : operation + columns + condition, "values" : values };
};

exports.createInsertQuery = function (columnData, tableName) {
    let length = Object.keys(columnData).length;
    let counter = 0;
    let values = [];
    let operation = 'INSERT INTO ' + tableName + '(';
    let columns = '';
    for (data in columnData) {
        columns += data;
        if (++counter < length) {
            columns += ', ';
        } else {
            columns += ') VALUES ?';
        }
        values.push(columnData[data]);
    }
    return { "query" : operation + columns, "values" : [values] };
};

exports.generateHashkey =  function (key) {
    return bcrypt.hashSync(key, bcrypt.genSaltSync());
};

exports.compareHashkeys =  function (key1, key2, done) {
    return done(bcrypt.compareSync(key1, key2));
};

exports.generateAuthToken = function (user) {
    return jwt.sign({"id" : user.uid, "timestamp" : new Date()}, jwtKey, {
        expiresIn: 3600
    });
};

exports.authMiddleware = function(req, res, next) {
    let token = req.get(authHeaderKey);
    if (token) {
        jwt.verify(token, jwtKey, function(err, result) {
            if (err) {
                return res.status(401).send({
                    "success": false,
                    "message": "Unauthorized - create account to update."
                });
            } else {
                userModel.getLogoutTime(result, function (flag, output) {
                    // Check if generated token is a expired one by comparing with last logout time.
                    let check = new Date(result.timestamp).toTimeString() > new Date(output.lastlogout).toTimeString();
                    if (flag && check) {
                        req.authToken = result;
                        next();
                    } else {
                        return res.status(401).send({
                            "success": false,
                            "message": "Unauthorized - not logged in."
                        });
                    }
                });
            }
        });
    } else {
        res.status(401).send({
            "success": false,
            "message": "Unauthorized - not logged in."
        });
    }
}
