const userModel = require('../models/user.server.model');
const helper = require('../utilities/helper');

exports.read = function (req, res) {
    let userId = req.params.id;
    userModel.getOne(userId, function (flag, result) {
        if (flag && result.length === 0) {
            return res.status(404).send({
                "success": false,
                "message": "User not found"
            });
        }
        else if (flag && result.length > 0) {
            let userData = result[0];
            return res.status(200).send({
                "id": userData.uid,
                "username": userData.username,
                "location": userData.location,
                "email": userData.email
            });
        } else {
            return res.json(result);
        }
    });
};

exports.update = function (req, res) {
    let user_data = {};
    let data = req.body;
    let profileInfo = req.body.user;
    if (profileInfo === undefined || !profileInfo.hasOwnProperty('id')) {
        res.send(400, 'Malformed data');
        return;
    }
    user_data['uid'] = req.params.id;
    user_data = prepareUserData(user_data, profileInfo);
    if (data.hasOwnProperty('password')) {
        user_data['password'] = helper.generateHashkey(data['password'].toString());
    }
    userModel.alter(user_data, function (flag, result) {
        if (flag && result.affectedRows === 0) {
            return res.status(404).send({
                "success": false,
                "message": "User not found"
            });
        }
        else if (flag && result.affectedRows > 0) {
            return res.status(200).send({
                "success" : true,
                "message" : "User updated"
            });
        } else {
            return res.json(result);
        }
    });
};

exports.delete = function (req, res) {
    let userId = req.params.id;
    userModel.remove(userId, function (result) {
        if (result !== undefined && result.hasOwnProperty('affectedRows') && result.affectedRows > 0) {
            return res.status(200).send({
                "success" : true,
                "message" : "User deactivated."
            });
        } else if (result === false) {
            return res.status(401).send({
                "success" : false,
                "message" : "User is a sole creator of one or more projects."
            });
        } else {
            return res.status(404).send({
                "success" : false,
                "message" : "User not found."
            });
        }
    });
};

exports.create = function (req, res) {
    let user_data = {};
    let data = req.body;
    let profileInfo = req.body.user;
    if (!requiredUserFields(data)) {
        res.status(400).send({
            "status" : false,
            "message" : "Malformed request."
        });
        return;
    }
    user_data = prepareUserData(user_data, profileInfo);
    user_data['password'] = helper.generateHashkey(data['password'].toString());
    userModel.getUserForName(user_data["username"], function (user) {
        if (user !== null && user !== undefined) {
            res.status(400).send({
                "status" : false,
                "message" : "User name already exists. Please choose another username."
            });
        } else {
            userModel.insert(user_data, function (result) {
                if (!result) {
                    res.status(400).send({
                        "status" : false,
                        "message" : "Create user request could not be completed."
                    });
                } else {
                    res.status(201).send({
                        "status" : true,
                        "message" : "New user created."
                    })
                }
            });
        }
    });
};

exports.login = function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    userModel.validateUser(username, password, function (err, user) {
        if(err) {
            res.status(400).send({
                "status" : false,
                "message" : "Login request could not be completed."
            });
        } else if (user === null) {
            res.status(400).send({
                "status" : false,
                "message" : "Invalid username/password supplied."
            });
        } else {
            let token = helper.generateAuthToken(user);
            res.status(200).send({
                "success" : true,
                "id" : user.uid,
                "token" : token
            });
        }
    });
};

exports.logout = function (req, res) {
    let userId = req.authToken.id;
    userModel.updateLogoutTime(userId, function (flag) {
        if (!flag) {
            console.log("Could not record users logout time.")
            return res.status(401).send({
                "success" : false,
                "message" : "Try logging out again."
            });
        } else {
            console.log("User's logout time updated.")
            return res.status(200).send({
                "success" : true,
                "id" : "",
                "token" : "",
                "message" : "Log out successful"
            });
        }
    });
};

let prepareUserData = function (user_data, profileInfo) {
    if (profileInfo.hasOwnProperty('username')) {
        user_data['username'] = profileInfo['username'].toString();
    }
    if (profileInfo.hasOwnProperty('fname')) {
        user_data['fname'] = profileInfo['fname'].toString();
    }
    if (profileInfo.hasOwnProperty('mname')) {
        user_data['mname'] = profileInfo['mname'].toString();
    }
    if (profileInfo.hasOwnProperty('lname')) {
        user_data['lname'] = profileInfo['lname'].toString();
    }
    if (profileInfo.hasOwnProperty('location')) {
        user_data['location'] = profileInfo['location'].toString();
    }
    if (profileInfo.hasOwnProperty('email')) {
        user_data['email'] = profileInfo['email'].toString();
    }
    if (profileInfo.hasOwnProperty('status')) {
        user_data['status'] = profileInfo['status'];
    }
    return user_data;
};

let requiredUserFields = function (data) {
    let profileInfo = data.user;
    return profileInfo !== undefined && profileInfo.hasOwnProperty("username") && profileInfo.hasOwnProperty("email") && data.hasOwnProperty("password");
};

exports.verifyAccountOwnership = function (req, res, next) {
    let user = req.params.id;
    let authUser = req.authToken.id;
    if (user.toString() === authUser.toString()) {
        console.log("Ownership verified!")
        next();
    } else {
        return res.status(403).send({
           "success" : false,
           "message" : "Forbidden - account not owned."
        });
    }
};