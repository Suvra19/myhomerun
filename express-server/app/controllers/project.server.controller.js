const projectModel = require('../models/project.server.model'),
    userModel = require('../models/user.server.model'),
    pledgeModel =  require('../models/pledge.server.model'),
    helper = require('../utilities/helper'),
    multer = require('multer'),
    path = require('path');

exports.list = function (req, res) {
    projectModel.getAll(function (flag, result) {
        if (flag && result.length === 0) {
            return res.status(404).send({
                "success": false,
                "message": "Projects not found"
            });
        }
        else if (flag && result.length > 0) {
            let projectData = [];
            let startIndex = req.query.startIndex === undefined ? 0 : req.query.startIndex;
            let count =  req.query.count === undefined ? result.length : req.query.count;
            result.slice(startIndex, startIndex + count).forEach(function (project) {
                let data = {
                    "id": project.pid,
                    "title": project.ptitle,
                    "subtitle": project.psubtitle,
                    "imageUri": project.image_uri
                }
                projectData.push(data);
            });
            return res.status(200).send(projectData);
        } else {
            return res.json(result);
        }
    });
};

exports.create = function (req, res) {
    let project_data = {};
    let reward_data = [];
    let creator_data = [];
    let data = req.body;
    if (checkAllRequiredFields(data)) {
        res.send(400, 'Malformed data');
        return;
    }
    prepareProjectData(project_data, data);
    if (data.rewards !== null) {
        prepareRewardList(data.rewards, reward_data);
    }
    prepareCreatorList(data.creators, creator_data);
    projectModel.insert(project_data, reward_data, creator_data, function (result) {
        if (result) {
            res.status(201).send("New project created");
        } else {
            res.status(400).send("Request could not be completed.");
        }
    });
};

exports.read = function (req, res) {
    let projectId = req.params.id;
    projectModel.getOne(projectId, function (result) {
        res.json(result);
    });
};

exports.update = function (req, res) {
    let projectId = req.params.id;
    let data = req.body;
    if (!data.hasOwnProperty('open')) {
        res.status(400).send("Malformed request");
        return;
    }
    let statusData = [
        data.open,
        projectId
    ];
    projectModel.setStatus(statusData, function (result) {
        if(result) {
            res.status(200).send({
                "success" : true,
                "message" : "Project status changed."
            });
        } else {
            res.status(401).send({
                "success" : false,
                "message" : "Unauthorized - create account to update project"
            });
        }
    });
};

exports.viewImage = function (req, res) {
    let projectId = req.params.id;
    projectModel.getImage(projectId, function (result) {
        if (result.length > 0 && result[0].hasOwnProperty('image_uri') && result[0].image_uri !== null) {
            res.sendFile('/' + result[0].image_uri, {root : __dirname + '/../../'});
        } else {
            res.status(404).send({
                "success" : "false",
                "message" : "Image not found for project."
            });
        }
    })
};

exports.pledge = function (req, res) {
    let pledgeData = {};
    if (!requiredPledgeData(req.body)) {
        return res.status(400).send({
                "success": false,
                "message": "Bad pledge details"
            });
    }
    preparePledgeData(req, pledgeData);
    pledgeModel.insert(pledgeData, function (flag, result) {
        if (flag && result.affectedRows > 0) {
            return res.status(200).send({
                "success": true,
                "message": "Pledge accepted"
            });
        } else {
            res.status(400).send({
                "success": false,
                "message": "Bad project or pledge details"
            });
        }
    });
};

exports.viewRewards = function (req, res) {
    let projectId = req.params.id;
    projectModel.getRewards(projectId, function (flag, result) {
        if (flag && result.length === 0) {
            return res.status(404).send({
                "success": false,
                "message": "Project/Reward not found"
            });
        }
        else if (flag && result.length > 0) {
            let rewardData = [];
            result.forEach(function (reward) {
                let data = {
                    "id": reward.rwid,
                    "amount": reward.rwamount,
                    "description": reward.rwdescription
                }
                rewardData.push(data);
            });
            return res.status(200).send(rewardData);
        } else {
            return res.json(result);
        }
    })
};

exports.updateRewards = function (req, res) {
    let rewardData = [];
    let rewards = req.body;
    let projectId = req.params.id;
    rewards.forEach(function (reward) {
        let temp = {};
        if (reward.hasOwnProperty('amount') && reward.hasOwnProperty('description')) {
            temp['project_id'] = projectId,
            temp['rwamount'] = reward.amount;
            temp['rwdescription'] = reward.description;
            rewardData.push(temp);
        }
    });
    if (rewardData.length === 0) {
        return res.status(400).send({
            "success" : false,
            "message" : 'Malformed request'
        });
    }
    projectModel.alterRewards(projectId, rewardData, function (result) {
        if (result) {
            return res.status(201).send({
                "success" : true,
                "message" : "Rewards updated"
            });
        } else {
            return res.status(401).send({
                "success" : false,
                "message" : 'Request to update rewards could not be complete'
            });
        }
    });
};

let requiredPledgeData = function (data) {
    return data !== undefined && data.hasOwnProperty('amount') && data.hasOwnProperty('card');
}

let checkAllRequiredFields = function (data) {
    return data === undefined || data.title === undefined || data.description === undefined || data.target === undefined;
};

let prepareProjectData = function (project_data, data) {
    if (data.hasOwnProperty('title')) {
        project_data['ptitle'] = data['title'].toString(); //make the db column names const in db.js
    }
    if (data.hasOwnProperty('subtitle')) {
        project_data['psubtitle'] = data['subtitle'].toString();
    }
    if (data.hasOwnProperty('description')) {
        project_data['pdesc'] = data['description'].toString();
    }
    if (data.hasOwnProperty('imageUri')) {
        project_data['image_uri'] = data['imageUri'].toString();
    }
    if (data.hasOwnProperty('target')) {
        project_data['target_amount'] = data['target'].toString();
    }
};

let prepareRewardList = function (rewards, reward_data) {
    let index = 0;
    rewards.forEach( function (reward) {
         if (reward.hasOwnProperty('amount') || reward.hasOwnProperty('description')) {
             reward_data[index] = {
                 "rwamount" : reward['amount'].toString(),
                 "rwdescription" : reward['description'].toString()
             };
             index++;
         }
    });
};

let prepareCreatorList = function (creators, creator_data) {
    let index = 0;
    creators.forEach( function (creator) {
        userModel.getUserForName(creator['name'], function (user) {
            if (user !== undefined && user.hasOwnProperty('uid')) {
                creator_data[index] = {
                    "user_id" : user.uid,
                    "role" : helper.creator
                };
                index++;
            }
        });
    });
};

let preparePledgeData =  function (request, pledgeData) {
    let data = request.body;
    pledgeData['plamount'] = data['amount'].toString();
    if (data.hasOwnProperty('anonymous') && data['anonymous'] === true) {
        pledgeData['backer_id'] = null;
    } else {
        pledgeData['backer_id'] = request.authToken.id;
    }
    pledgeData['project_id'] = request.params.id;
    pledgeData['cctoken'] = data.card.authToken.toString();
};

exports.updateImage = function (req, res) {
    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + req.params.id + path.extname(file.originalname));
        }
    });
    let upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            let ext = path.extname(file.originalname);
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                return callback(res.end('Only images are allowed'), null);
            }
            callback(null, true);
        }
    }).single('projectImage');

    upload(req, res, function (err) {
        if (err || req.file === undefined) {
            res.status(400).send({
                "success" : false,
                "message" : "Image upload failed"
            });
            return;
        }

        let imageData = [
            req.file.path,
            req.params.id
        ];
        projectModel.updateImageUri(imageData, function (result) {
            if (result) {
                res.status(201).send({
                    "success" : true,
                    "message" : "Image upload successful"
                });
            } else {
                res.status(400).send({
                    "success" : false,
                    "message" : "Image upload failed"
                });
            }
        })
    });
};

exports.checkProjectOwnership = function (req, res, next) {
    let projectId = req.params.id;
    let userId = req.authToken.id;
    projectModel.verifyProjectCreator(projectId, userId, function (result) {
       if (result) {
           next();
       } else {
           return res.status(403).send({
               "success" : false,
               "message" : "Forbidden - unable to update a project you do not own."
           });
       }
    });
};