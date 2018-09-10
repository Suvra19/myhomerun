const db = require('../../config/db');
const helper = require('../utilities/helper');

exports.getOne = function (userId, done) {
    db.get().query('SELECT * FROM users WHERE uid = ?', [userId], function (err, result) {
        if (err) return done(false, err);
        done(true, result);
    });
};

exports.alter = function (userData, done) {
    let sql = helper.createUpdateQuery(userData, 'users', 'uid');
    db.get().query(sql.query, sql.values, function (err, result) {
        if (err) return done(false, err);
        done(true, result);
    });
};

exports.remove = function (userId, done) {
    checkLoneCreator(userId, function (output) {
        if (!output) {
            let userData = {
                "uid" : userId,
                "status" : false
            }
            let sql = helper.createUpdateQuery(userData, 'users', 'uid');
            db.get().query(sql.query, sql.values, function (err, result) {
                if (err) return done(err);
                done(result);
            });
        } else {
            done(false);
        }
    });

};

let checkLoneCreator = function (userId, done) {
    let sql = "select project_id from contributor where user_id = ? and role = ?";
    let params = [
        userId,
        helper.creator
    ];
    db.get().query(sql, params, function (err, results) {
        if (err) return done(false);
        else if (results.length > 0) {
            results.forEach(function (result) {
                let sql = 'select count(*) as numOfCreators from contributor where project_id = ? group by role having role = ?';
                let params = [
                    result.project_id,
                    helper.creator
                ];
                db.get().query(sql, params, function (err, results) {
                    if (err) return done(false);
                    if (results[0].numOfCreators === 1) {
                        return done(true);
                    }
                });
            });
        } else {
            done(false);
        }
    });
};

exports.insert = function (userData, done) {
    let sql = helper.createInsertQuery(userData, 'users');
    db.get().query(sql.query, [sql.values], function (err, result) {
        if (err) return done(false);
        done(true);
    });
};

exports.validateUser = function (username, password, done) {
    db.get().query('SELECT * FROM users WHERE username = ?', [username], function (err, result) {
       if (err) {
           return done(err, null);
       } else if (result.length > 0) {
            helper.compareHashkeys(password, result[0]['password'], function (isValid) {
                if (isValid) {
                    return done(null, result[0]);
                }
                done(null, null);
            });
       } else {
           done(null, null);
       }
    });
};

exports.getUserForName =  function (username, done) {
    db.get().query('SELECT * FROM users WHERE username = ?', [username], function (err, result) {
        if (err) return done(null);
        return done(result[0]);
    });
};

exports.updateLogoutTime = function (userId, done) {
    let sql = "update users set lastlogout = ? where uid = ?";
    let logoutData = [
        new Date(),
        userId.toString()
    ];
    db.get().query(sql, logoutData, function (error, result) {
       if (error) {
           console.log("Could not update logout time");
           return done(false);
       }
       done(true);
    });
};

exports.getLogoutTime = function (token, done) {
    let data = [
        token.id,
    ];
    let sql = "select lastlogout from users where uid = ?";
    db.get().query(sql, data, function (error, result) {
        if (error) {
            console.log("Could not get logout time");
            return done(false, null);
        }
        done(true, result[0]);
    });
};