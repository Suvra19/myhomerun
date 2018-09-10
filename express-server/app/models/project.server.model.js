const db = require('../../config/db');
const helper = require('../utilities/helper');
const async = require('async');

exports.getOne = function (projectId, done) {
    async.waterfall([
           async.apply(getProject, projectId),
           getCreators,
           getRewards,
           getProgress,
           getBackers,
           adjustAnonymousBackers,
        ], function (err, result) {
            if (err) return done(err);
            done(result);
        }
    );
};

let getProject = function (projectId, callback) {
    db.get().query('SELECT * FROM project WHERE pid = ?', [projectId], function (err, result) {
        if(err) {
            console.log("Project with id : "+projectId+" not found. "+err);
            return callback(err, null);
        }
        let projectData = result[0];
        let output = {
            "project" : {
                "id" : projectData.pid,
                "creationDate" : projectData.pcreation_date,
                "data" : {
                    "title" : projectData.ptitle,
                    "subtitle" : projectData.psubtitle,
                    "description" : projectData.pdesc,
                    "imageUri" : projectData.image_uri,
                    "target" : projectData.target_amount,
                    "creators" : [],
                    "rewards" : []
                }
            },
            "progress" : {
                "target" : "",
                "currentPledged" : "",
                "numberOfBackers" : ""
            },
            "backers" : []
        };
        callback(null, output);
    });
};

let getCreators = function (output, callback) {
    let params = [
        [helper.creator],
        [output.project.id]
    ];
    db.get().query('select u.uid, u.username from users as u join contributor as c on u.uid = c.user_id where c.role = ? and c.project_id = ?', params, function (err, result) {
        if(err) {
            console.log("Add creators failed. " + err);
            return callback(err, null);
        }
        result.forEach(function (res) {
           output.project.data.creators.push({
               "id" : res.uid,
               "name" : res.username
           });
        });
        callback(null, output);
    });
};

let getRewards = function (output, callback) {
    let params = [output.project.id];
    db.get().query('select rwid, rwamount, rwdescription from reward where project_id = ?', params, function (err, result) {
        if (err) {
            console.log("Add rewards failed." + err);
            return callback(err, null);
        }
        result.forEach(function (res) {
            output.project.data.rewards.push({
                "id" : res.rwid,
                "amount" : res.rwamount,
                "description" : res.rwdescription
            });
        });
        callback(null, output);
    });
};

let getProgress =  function (output, callback) {
    let params = [output.project.id];
    db.get().query('select sum(plamount) as currentPledged, count(distinct backer_id) as numberOfBackers from pledge where project_id = ?', params, function (err, result) {
        if (err) {
            console.log("Add progress failed." + err);
            return callback(err, null);
        }
        output.progress.target = output.project.data.target;
        output.progress.currentPledged = result[0].currentPledged;
        output.progress.numberOfBackers = result[0].numberOfBackers;
        callback(null, output);
    });
};

let getBackers = function (output, callback) {
    let params = [output.project.id];
    db.get().query('select u.username as name, pl.plamount as amount from users as u join pledge as pl on u.uid=pl.backer_id where pl.project_id = ?', params, function (err, result) {
        if(err) {
            console.log("Add backers failed. " + err);
            return callback(err, null);
        }
        let totalAmount = 0;
        result.forEach(function (res) {
            totalAmount += res.amount;
            output.backers.push({
                "name" : res.name,
                "amount" : res.amount
            });
        });
        callback(null, output, totalAmount);
    });
};

let adjustAnonymousBackers =  function (output, totalAmount, callback) {
    if (totalAmount < output.progress.currentPledged) {
        output.backers.push({
            "name" : "anonymous",
            "amount" : output.progress.currentPledged - totalAmount
        });
    }
    db.get().query('select count(plid) as totalBackers from pledge where project_id = ?', [output.project.id], function (err, result) {
        if(err) {
            console.log("Add backers failed. " + err);
            return callback(err, null);
        }
        if (result[0].totalBackers > output.progress.numberOfBackers) {
            output.progress.numberOfBackers += (result[0].totalBackers - output.progress.numberOfBackers);
        }
        callback(null, output);
    });
}

exports.getAll = function (done) {
    db.get().query('SELECT * FROM project', function (err, result) {
        if (err) return done(false, err);
        done(true, result);
    });
};

exports.insert = function (project_data, reward_data, creator_data, done) {
    let sql = helper.createInsertQuery(project_data, 'project');
    db.get().query(sql.query, [sql.values], function (err, results) {
        if (err) {
            console.log("Error: Insert new project failed.");
            return done(false);
        }
        let project_id = results.insertId;
        insertRewards(project_id, reward_data);
        insertCreators(project_id, creator_data);
        done(true);
    });
};

let insertRewards = function (project_id, reward_data) {
    reward_data.forEach(function (reward) {
        reward['project_id'] = project_id;
        let sql = helper.createInsertQuery(reward, 'reward');
        db.get().query(sql.query, [sql.values], function (err) {
            if (err) {
                console.log("Error: Insert query for Rewards failed during project creation.")
            }
        });
    });
};

let insertCreators =  function (project_id, creator_data) {
    creator_data.forEach(function (creator) {
        creator['project_id'] = project_id;
        let sql = helper.createInsertQuery(creator, 'contributor');
        db.get().query(sql.query, [sql.values], function (err) {
            if (err) {
                console.log("Error: Insert query for contributor failed during project creation.")
            }
        });
    });
};

exports.getImage = function (projectId, done) {
    db.get().query('select image_uri from project where pid = ?', [projectId], function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.getRewards = function (projectId, done) {
    db.get().query('select rwid, rwamount, rwdescription from reward where project_id = ?', [projectId], function (err, result) {
        if (err) return done(false, err);
        done(true, result);
    });
};

exports.alterRewards = function (projectId, rewardData, done) {
    async.waterfall([
        async.apply(deleteRewards, projectId, rewardData),
        insertNewRewards
    ], function (err, res) {
        if (err) {
            return done(false);
        }
        done(res);
    });
};

let deleteRewards = function (projectId, rewardData, callback) {
    let sql = "delete from reward where project_id = ?";
    let params = [projectId];
    db.get().query(sql, params, function (err, res) {
        if (err) {
            console.log("Deleting reward failed.");
            return callback(err, null);
        }
        callback(null, projectId, rewardData);
    });
}

let insertNewRewards = function (projectId, rewardData, callback) {
    rewardData.forEach(function (rw) {
        let sql = helper.createInsertQuery(rw, 'reward');
        db.get().query(sql.query, [sql.values], function (err, res) {
            if (err) {
                console.log("Insert reward failed.");
            }
        });
    });
    callback(null, true);
}

exports.setStatus = function (statusData, done) {
    db.get().query('update project set status = ? where pid = ?', statusData, function (err, res) {
        if (err) {
            console.log("Error: Status of project could not be updated");
            return done(false);
        }
        done(true);
    })
};

exports.updateImageUri = function (imageData, done) {
    db.get().query('update project set image_uri = ? where pid = ?', imageData, function (err, res) {
        if (err) {
            console.log("Error: Image could not be updated in db.");
            return done(false);
        }
        done(true);
    });
};

exports.verifyProjectCreator =  function (projectId, userId, done) {
    let params = [
        userId,
        projectId,
        helper.creator
    ];
    let sql = 'select * from contributor where user_id = ? and project_id = ? and role = ?';
    db.get().query(sql, params, function (err, res) {
        if (res.length > 0) return done(true);
        done(false);
    });
};