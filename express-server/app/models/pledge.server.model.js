const db = require('../../config/db');
const helper = require('../utilities/helper');
const async = require('async');

exports.insert = function (pledgeData, done) {
    validateBacker(pledgeData['project_id'], pledgeData['backer_id'], function (output) {
        if (!output) {
            return done(false, null);
        } else {
            async.waterfall([
                    async.apply(updatePledge, pledgeData),
                    updateBacker
                ], function (err, result) {
                    if (err) return done(false, err);
                    done(true, result);
                }
            );
        }
    });
};

let updatePledge =  function (pledgeData, callback) {
    let sql = helper.createInsertQuery(pledgeData, 'pledge');
    db.get().query(sql.query, [sql.values], function (err, result) {
        if (err) return callback(err, null);
        callback(null, result, pledgeData['project_id'], pledgeData['backer_id']);
    });
};

let updateBacker = function (output, project_id, user_id, callback) {
    if (user_id === null) return callback(null, output);
    let backerData =  {
        "project_id" : project_id,
        "user_id" : user_id,
         "role" : helper.backer
    };
    let sql = helper.createInsertQuery(backerData, 'contributor');
    db.get().query(sql.query, [sql.values], function (err, result) {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

let validateBacker = function (project_id, backer_id, done) {
    if (backer_id === null) {
        return done(true);
    }
    let sql = 'select count(*) as count from contributor where user_id = ? and project_id = ? and role = ?';
    let params = [
        backer_id,
        project_id,
        helper.creator
    ];
    db.get().query(sql, params, function (err, res) {
       if (err) return done(false);
       else if (res[0].count === 0) {
           return done(true)
       }
       done(false);
    });
};


