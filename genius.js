//----------- _^_^_ ---------------------------
// genius.js (_0_0_)   Josh Dolitsky 2012      |
//----------- "~o~" ---------------------------
// socket.io-based lightweight web development |
//---------------------------------------------


// configuration defaults
var path = './';
var viewFolder = 'views';
var jsFolder = 'js';
var cssFolder = 'css';
var imgFolder = 'img';
var fileFolder = 'files';
var indexFile = 'index.js'; 
var topInc = 'top.js';
var bottomInc = 'bottom.js';
var httpPort = 80;
var filePort = 81;
var ioPort = 3000;

var http = require('http');
var io = require('socket.io').listen(ioPort);
var fs = require('fs');

var viewStr = path+viewFolder+'/';

// only directories allowed to be accessed by file server
var allFolders = [jsFolder,cssFolder,imgFolder,fileFolder];

var ioRegex = new RegExp('{GENIUS-IO-PORT}', 'g');
var fileRegex = new RegExp('{GENIUS-FILE-PORT}', 'g');
var incRegex = new RegExp('{GENIUS-INCLUDE}', 'g');

var includeScript;
fs.readFile(path+'include.js', 'utf8', function (err, html) {
	includeScript=html;
});

// Server 1: File Server
// this serves actual files via port 'filePort'
http.createServer(function (req, res) {
	var urlA = req.url.split('/');
	var first = urlA[1];
	if (first) {
		var second = urlA[2];
		// check if arg1 in 'otherFolers' array
		if (allFolders.indexOf(first)!=-1) {
			if (second) {
				var filePath = path+req.url;
				fs.readFile(filePath, 'utf8', function (err, html) {
					if (!err) { 
						// write file contents, end response
						res.writeHead(200);
						res.write(html);
						res.end();
					} else {
						// specific file not found
						res.writeHead(404);
						res.end();
					}	
				});
			} else {
				// directory name, but no file name
				res.writeHead(404);
				res.end();
			}			
		} else {
			// not an accepted directory
			res.writeHead(404);
			res.end();
		}
	} else {
		// no file name provided
		res.writeHead(404);
		res.end();
	}

}).listen(filePort);

// Server 2: View/Action server
// not bound to any files or directories, 
// handles displaying of views via port 'httpPort'
http.createServer(function (req, res) {
	var urlA = req.url.split('/');
	var first = urlA[1];
	res.writeHead(200, { 'Content-Type': 'text/html' });
	var body='';
	// include top layout
	fs.readFile(viewStr+topInc, function (err, html) {
		if (err) { res.write(err);} else { 
			body+=html;
		}
	});

	// include view file
	var fn = viewStr+indexFile;
	fs.readFile(fn, function (err, html) {
		if (err) { res.write(err);} else { body+=html;}
	});

	// include bottom layout, end response
	fs.readFile(viewStr+bottomInc, function (err, html) {
		if (err) { res.write(err);} else { 
			body+=html;
			var temp = body.toString();
			var addTo = 'http://'+req.headers.host+':';
			// this order is important
			temp = temp.replace(incRegex,includeScript);
			temp = temp.replace(ioRegex,addTo+ioPort);
			temp = temp.replace(fileRegex,addTo+filePort);
			res.write(temp);
		}
		res.end();
	});

}).listen(httpPort);

// Server 3: Asynchronous IO server
// handles all real-time events and actions
io.sockets.on('connection', function (socket) {
	socket.on('commence', function (data) {
		// handle session etc.
	});
	socket.on('send', function (data) {
		// TODO add action handlers etc.
		if (data.action=='addNums') {
			var result=data.a+data.b;
			socket.emit('receive'+data.resNum,{result:result});
		}
	});

});
