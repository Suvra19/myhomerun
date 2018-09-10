const mysql = require('mysql'),
        async = require('async');

const state = {
    pool : null
};

exports.connect = function (done) {
    state.pool = mysql.createPool({
        host : process.env.SENG365_MYSQL_HOST || 'localhost',
        port : process.env.SENG365_MYSQL_PORT || 3306,
        user : 'root',
        password : 'secret',
        database : 'table11'
    });
    done();
};

exports.get = function () {
    return state.pool;
};

exports.initDatabase =  function (pool) {
    async.waterfall([
        async.apply(dropContributor, pool),
        dropPledge,
        dropReward,
        dropProject,
        dropUser,
        createUsers,
        createProjects,
        createRewards,
        createContributors,
        createPledges,
        insertSampleUsers,
        insertSampleProjects,
        insertSampleRewards,
        insertSamplePledges,
        insertSampleContributors
    ], function (error, result) {
        if (error) {
            console.log("Something went wrong during db initialization.")
        } else {
            console.log("db initialization complete.")
        }
    });
};

let dropContributor = function (pool, callback) {
    pool.query("DROP TABLE IF EXISTS contributor", function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Dropped contributor table");
        callback(null, pool);
    });
}

let dropPledge = function (pool, callback) {
    pool.query("DROP TABLE IF EXISTS pledge", function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Dropped pledge table");
        callback(null, pool);
    });
}

let dropReward = function (pool, callback) {
    pool.query("DROP TABLE IF EXISTS reward", function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Dropped reward table");
        callback(null, pool);
    });
}

let dropProject = function (pool, callback) {
    pool.query("DROP TABLE IF EXISTS project", function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Dropped project table");
        callback(null, pool);
    });
}

let dropUser = function (pool, callback) {
    pool.query("DROP TABLE IF EXISTS users", function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Dropped users table");
        callback(null, pool);
    });
}

let createUsers = function (pool, callback) {
    pool.query("CREATE TABLE IF NOT EXISTS users (" +
        "uid int auto_increment," +
        "username varchar(10) not null," +
        "fname varchar(20)," +
        "mname varchar(20)," +
        "lname varchar(20)," +
        "email varchar(50) not null," +
        "location varchar(50)," +
        "password char(60) not null," +
        "status boolean not null default true, " +
        "lastlogout timestamp not null default now()," +
        "primary key (uid, username));", function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Users table created");
        callback(null, pool);
    });
}

let createProjects = function (pool, callback) {
    pool.query("CREATE TABLE IF NOT EXISTS project (" +
        "pid int auto_increment," +
        "ptitle varchar(20)," +
        "psubtitle varchar(100)," +
        "pdesc varchar(255) not null," +
        "pcreation_date timestamp not null default now()," +
        "target_amount decimal(13,2) not null," +
        "current_amount decimal(13,2)," +
        "image_uri varchar(255)," +
        "status boolean not null default true,"+
        "primary key (pid, ptitle));", function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Project table created");
        callback(null, pool);
    });
}

let createRewards = function (pool, callback) {
    pool.query("CREATE TABLE IF NOT EXISTS reward (" +
        "rwid int auto_increment," +
        "rwamount decimal(13,2) not null," +
        "rwdescription varchar(255) not null," +
        "project_id int not null," +
        "backer_id int," +
        "primary key (rwid)," +
        "foreign key (project_id) references project(pid)," +
        "foreign key (backer_id) references users(uid));", function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Reward table created");
        callback(null, pool);
    });
}

let createContributors = function (pool, callback) {
    pool.query("CREATE TABLE IF NOT EXISTS contributor (" +
        "project_id int," +
        "user_id int," +
        "role varchar(10)," +
        "primary key (project_id, user_id, role)," +
        "foreign key (project_id) references project(pid)," +
        "foreign key (user_id) references users(uid));", function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Contributor table created");
        callback(null, pool);
    });
}

let createPledges = function (pool, callback) {
    pool.query( "CREATE TABLE IF NOT EXISTS pledge (" +
        "plid int auto_increment," +
        "plamount decimal(13,2) not null," +
        "backer_id int," +
        "project_id int not null," +
        "cctoken varchar(255) not null," +
        "primary key (plid)," +
        "foreign key (backer_id) references users(uid)," +
        "foreign key (project_id) references project(pid));", function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Pledge table created");
        callback(null, pool);
    });
}

let insertSampleUsers = function (pool, callback) {
    let sql = "insert into users(username, fname, mname, lname, email, location, password) values ?";
    let values = [["johnsnow", "John", "", "Snow", "jsnow@targaryan.com", "North of the wall", "$2a$10$Y32GNbRKuEesZCKgm0JWbukDurAcgXcEZyqfMfEEx3jCGTTkX.EDm"],
        ["nedstark", "Ned", "", "Stark", "ned@kinginthenorth.com", "The north", "$2a$10$ETKsFdTZ4EASKff9c6YueOKFUa7rFgOPV7fSB5eWpuI9mWKAp6LDK"],
        ["aryastark", "Arya", "", "Stark", "astark@noone.com", "Bravos", "$2a$10$vc.ZyNfVAHdLBevXBju1OeBn38wXU4Uc03x8uDjIhoiF7N0ANy1F6"],
        ["danny", "Danny", "", "Targaryan", "danny@targaryan.com", "Westeros", "$2a$10$wkJDlapKuZDfddSfjN3K7un7BgUne0o3rgs262FkasA4v3orkhznu"],
        ["tyrion", "Tyrion", "", "Lannister", "tyrion@lannister.com", "Westeros", "$2a$10$JWML5O5djXWGh1wI/YY3huE4UxhG.hrMul0/9FGJveemMKqF8V5OG"]
    ];
    pool.query(sql, [values], function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Sample users inserted");
        callback(null, pool);
    });
}

let insertSampleProjects = function (pool, callback) {
    let sql = 'insert into project(ptitle, psubtitle, pdesc, target_amount) values ?';
    let values = [
        ["Dragon glass", "Dragon glass", "Wanna kill white walkers", 1000.00],
        ["The wall", "The wall", "Create a wall", 2000.00]
    ];
    pool.query(sql, [values], function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Sample projects created");
        callback(null, pool);
    });
};

let insertSampleRewards = function (pool, callback) {
    let sql = 'insert into reward(rwamount, rwdescription, project_id, backer_id) values ?';
    let values = [
        [500.00, "Also not become a white-walker", 1, 4],
        [900.00, "Also be safe from white-walkers", 2, 5]
    ];
    pool.query(sql, [values], function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Sample rewards created");
        callback(null, pool);
    });
};

let insertSampleContributors = function (pool, callback) {
    let sql = "insert into contributor(project_id, user_id, role) values ?";
    let values = [[1, 1, 'CREATOR'], [2, 2, 'CREATOR'], [2, 3, 'CREATOR'], [1, 4, "BACKER"], [2, 5, "BACKER"]];
    pool.query(sql, [values], function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Sample contributors created");
        callback(null, pool);
    });
}

let insertSamplePledges = function (pool, callback) {
    let sql = 'insert into pledge(plamount, backer_id, project_id, cctoken) values ?';
    let values = [
        [200.00, 4, 1, "cc1"],
        [50.00, null, 1, "cc2"],
        [310.00, 5, 2, "cc3"],
    ];
    pool.query(sql, [values], function (err, result) {
        if (err) {
            console.log("Error: Query failed : "+err);
            return callback(err, null);
        }
        console.log("Sample pledges created");
        callback(null, pool);
    });
}