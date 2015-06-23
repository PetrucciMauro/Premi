//=========================
// get the packages we need
// ========================
var express    = require('express');
var app        = express();
app.use(express.static(__dirname + '/app'));
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');

var jwt    = require('jsonwebtoken');
var config = require('./config');
var User   = require('./models/user');
var http = require('http');
var path = require('path');

//==============
// configuration
//==============

var port = process.env.PORT || 8081;
mongoose.connect(config.database);
app.set('SuperSecret', config.secret); // secret variable

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.use(morgan('dev')); // to better log to console

//=======
// routes
//=======

// root := basic route
app.get('/', function(req, res) {
	res.sendfile('./app/index.html');
});

// API routes
app.get('/setup', function(req, res) {
	var nick = new User({
		username: 'admin',
		password: 'password',
		admin: true
	});

    //save the sample user
    nick.save(function(err) {
    	if(err) throw err;

    	console.log('User saved sucessfully');
    	res.json({ success: true });
    });
});

var apiRoutes = express.Router();

apiRoutes.post('/authenticate', function(req, res) {
    User.findOne({
    name: req.body.email ,password: req.body.password
    }, function(err, user) {
	if (err) throw err;

	if (!user) {
	    res.json({ success: false, message: 'Authentication failed. User not found.' });
	} else if (user) {
	    // check if password matches
	    if (user.password != req.body.password) {
		res.json({ success: false, message: 'Authentication failed. Wrong password.' });
	    } else {
		var token = jwt.sign(user, app.get('SuperSecret'), {
		    expiresInMinutes: 1440 // expires in 24 hours
		});
		// return the information including token as JSON
		res.json({
		    success: true,
		    message: 'Enjoy your token!',
		    token: token
		});
	    }
	}
    });
});

app.post('/signin', function(req, res) {
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
                var userModel = new User();
                userModel.email = req.body.email;
                userModel.password = req.body.password;
                userModel.save(function(err, user) {
                    user.token = jwt.sign(user, process.env.JWT_SECRET);
                    user.save(function(err, user1) {
                        res.json({
                            type: true,
                            data: user1,
                            token: user1.token
                        });
                    });
                })
            }
        }
    });
});



// route middleware to verify a token
apiRoutes.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {

	// verifies secret and checks exp
	jwt.verify(token, app.get('SuperSecret'), function(err, decoded) {      
		if (err) {
			return res.json({ success: false, message: 'Failed to authenticate token.' });    
		} else {
		// save the token decoded to be used next, fro exemple to get user_id if it is part of the token...
		req.decoded = decoded;    
		next();
	}
});
} else {

	// if there is no token
	// return an error
	return res.status(403).send({ 
		success: false, 
		message: 'No token provided.' 
	});

}
});


// get route
apiRoutes.get('/', function(req, res) {
	res.json({ message: 'Welcome to /api' });
});

apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users){
		res.json(users);
	});
});

app.use('/api', apiRoutes);

//=================
// start the server
//==================

app.listen(port);
console.log('Server listening at http//localhost: ' + port );




