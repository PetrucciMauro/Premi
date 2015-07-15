//============
// get modules
// ===========

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var jwt    = require('jsonwebtoken');
var config = require('./config');
var multer  = require('multer');
var fs = require('fs');

//==============
// configuration
//==============

var port = process.env.PORT || 8080;
app.set('database', config.database);
app.set('SuperSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID

//===============
// authentication
//===============

var Authenticate = require('./source/account/Authenticate.js');
var Register = require('./source/account/Register.js');
var Changepassword = require('./source/account/ChangePassword.js');

app.get('/', function(req, res) {
        res.send('Wellcome! to get a public file: /publicpages, account staff: /account, private services: /private'
																	);
								});

app.get('/account', function(req, res) {
								res.send('to register: ~/register, to authenticate: ~/authenticate, to change password: ~/changepassword');
								});

app.get('/account/authenticate', Authenticate.get );

app.post('/account/register', Register.post );

app.post('/account/changepassword', Changepassword.post );

//==================
// htmlpages_server
//==================

app.use('/publicpages', express.static('public_html'));

app.use('/private/htdocs', express.static('private_html'));


//==================
// token_middleware
//==================

var Middleware = require('./source/private/tokenMiddleware.js');

var privateRoutes = express.Router();
app.use('/private', privateRoutes);

privateRoutes.use(Middleware.use);

//==================
// files_server
//==================

var filesRoutes = express.Router();
app.use('/private/api/files', filesRoutes);

var ImagesMeta = require('./source/private/files/images/ImagesMeta.js');
filesRoutes.get('/image', ImagesMeta.get);

var VideosMeta = require('./source/private/files/videos/VideosMeta.js');
filesRoutes.get('/video', VideosMeta.get);

var AudiosMeta = require('./source/private/files/audios/AudiosMeta.js');
filesRoutes.get('/audio', AudiosMeta.get );

//======
// Image

var Image = require('./source/private/files/images/Image.js');

filesRoutes.delete('/image/[^/]+', Image.delete);

filesRoutes.get('/image/[^/]+', Image.get );

filesRoutes.post('/image/[^/]+', Image.post );

//======
// Video

var Video = require('./source/private/files/videos/Video.js');

filesRoutes.delete('/video/[^/]+', Video.delete );

filesRoutes.get('/video/[^/]+', Video.get );

filesRoutes.post('/video/[^/]+', Video.post );

//======
// Audio

var Audio = require('./source/private/files/audios/Audio.js');

filesRoutes.delete('/audio/[^/]+', Audio.delete );

filesRoutes.get('/audio/[^/]+', Audio.get );

filesRoutes.post('/audio/[^/]+', Audio.post );

//============
// RenameImage

var RenameImage = require('./source/private/files/images/RenameImage.js');

filesRoutes.post('/image/[^/]+/[^/]+', RenameImage.post );

//============
// RenameAudio

var RenameAudio = require('./source/private/files/audios/RenameAudio.js');

filesRoutes.post('/audio/[^/]+/[^/]+', RenameAudio.post );

//============
// RenameVideo

var RenameVideo = require('./source/private/files/videos/RenameVideo.js');

filesRoutes.post('/video/[^/]+/[^/]+', RenameVideo.post );


//=====================//////////////////////////////////////////////////////////////////////////////////////////
// presentations_server
//=====================///////////////////////////////////////////////////////////////////////////////////////////

var presentationRoutes = express.Router();
app.use('/private/api/presentations', presentationRoutes);

var PresentationMeta = require('./source/private/presentations/PresentationMeta.js');

presentationRoutes.get('/', PresentationMeta.get );

var NewPresentation = require('./source/private/presentations/new/NewPresentation.js');

presentationRoutes.post('/new/[^/]+', NewPresentation.post );

var NewCopyPresentation = require('./source/private/presentations/new/NewCopyPresentation.js');

presentationRoutes.post('/new/[^/]+/[^/]+', NewCopyPresentation.post );

//=============
// presentation

var Presentation = require('./source/private/presentations/presentation/Presentation.js');

presentationRoutes.get('/[^/]+', Presentation.get );

presentationRoutes.delete('/[^/]+', Presentation.delete );

//=======
// rename

var RenamePresentation = require('./source/private/presentations/presentation/RenamePresentation.js');

presentationRoutes.post('/[^/]+/rename/[^/]+', RenamePresentation.post );

//===============
// delete element

var DeleteElement = require('./source/private/presentations/presentation/DeleteElement.js');

presentationRoutes.delete('/[^/]+/delete/[^/]+/[^/]+', DeleteElement.delete );

//===============
// PresentationElement

var PresentationElement = require('./source/private/presentations/presentation/PresentationElement.js');

presentationRoutes.put('/[^/]+/element', PresentationElement.put );

presentationRoutes.post('/[^/]+/element', PresentationElement.post );


//==================
// start the server
//==================

app.listen(port);
console.log('Server listening at http//localhost: ' + port );


