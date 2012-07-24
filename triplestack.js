//--------------------_^_^_ --->
//     TripleStack   (_0_0_)   |
//--------------------"~o~" --->
// multi-port web development  |
//----------------------------->
//     Josh Dolitsky 2012      |
//----------------------------->

// configuration defaults
var path = './';
var viewFolder = 'View';
var modelFolder = 'Model';
var controllerFolder = 'Controller';
var jsFolder = 'js';
var cssFolder = 'css';
var imgFolder = 'img';
var fileFolder = 'files';
var indexFile = 'index.js'; 
var topInc = 'top.js';
var bottomInc = 'bottom.js';
var defaultModel = 'app.js';
var defaultView = 'app.js';
var defaultController = 'app.js';
var httpPort = 80;
var filePort = 81;
var ioPort = 3000;
var openScript = '<?js';
var closeScript = '?>';

var http = require('http');
var io = require('socket.io').listen(ioPort);
var fs = require('fs');
var vm = require('vm');

var viewStr = path+viewFolder+'/';

// only directories allowed to be accessed by file server
var allFolders = [jsFolder,cssFolder,imgFolder,fileFolder];

var cssRegex = new RegExp('{3S-CSS}', 'g');
var scriptsRegex = new RegExp('{3S-SCRIPTS}', 'g');
var ioRegex = new RegExp('{3S-IO-PORT}', 'g');
var fileRegex = new RegExp('{3S-FILE-PORT}', 'g');


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

	// create new vm context
	var allVars = {out:''};
	var context = vm.createContext(allVars);
	vm.runInContext('function spit(a){ out+=a;}',context);

	var urlA = req.url.split('/');

	var model = urlA[1];

	var view = urlA[2];

	
	var body='';
	var addTo = 'http://'+req.headers.host+':';
	// include top layout
	fs.readFile(viewStr+topInc, function (err, html) {
		if (err) { res.write(err);} else { 
			body+=html;
		}
	});

	// include view file
	var fn = viewStr;
	if (model && view) {
		fn+='/'+model+'/'+view+'.js';
		var modelFn = path+modelFolder+'/'+model+'.js';
		var viewFn = path+viewFolder+'/'+model+'/'+view+'.js';  
		var controlelrFn = path+controllerFolder+'/'+model+'.js'; 
	} else if (model) {
		fn+='/'+model+'/index.js';
		var modelFn = path+modelFolder+'/'+model+'.js';
		var viewFn = path+viewFolder+'/'+model+'/index.js'; 
		var controlelrFn = path+controllerFolder+'/'+model+'.js'; 
		view = 'index';
	} else {
		fn+=indexFile;
		var modelFn = path+modelFolder+'/'+defaultModel;
		var viewFn = path+viewFolder+'/'+defaultView;
		var controllerFn = path+controllerFolder+'/'+defaultController;
		view = 'index';
	}

	var j = '';
	console.log('Model: '+modelFn+'\nView: '+viewFn+'\nController: '+controllerFn);

	// add controller functions
	fs.readFile(controllerFn, function (err, js) {
		if (err) { 
			res.writeHead(404);
			res.end();
		} else {
			j += js;

			// run model code
			fs.readFile(modelFn, function (err, js2) {
				if (err) { 
					res.writeHead(404);
					res.end();
				} else {
					// add code from model, then call appropriate
					// function from controller
					j += js2+view+'();';
					console.log('SERVER SIDE JS:\n------\n'+j+'\n------');
					vm.runInContext(j,context);

					// run view file
					fs.readFile(viewFn, function (err, html) {
						if (err) { 
							res.writeHead(404);
							res.end();
						} else {
							res.writeHead(200, { 'Content-Type': 'text/html' });
							var data = html.toString();
							var s1=data.split(openScript);

							// number of <?js code blocks
							var s1Len = s1.length;
							if (s1Len > 1) {
								// interpret server-side code and output
								var temp;

								body +=s1[0];			
								for (var i=1;i<=s1Len-1;i++) { 
									temp = s1[i].split(closeScript);
									vm.runInContext(temp[0],context);
									body += context.out;
									context.out='';
									if (temp.length>1) {
										body+=temp[1];
									}
								}	
							} else {
								// no code blocks, just add everything
								body += data;
							}

							// build html for js includes
							var jsInc;
							if (!(jsInc = context.jsInc)) {
								jsInc = [];
							}
							var scripts = '';
							for (var i=0;i<jsInc.length;i++) {
								scripts += '\n<script src="'+addTo+filePort+'/'+jsFolder+'/'+jsInc[i]+'"></script>'
							}	

							// build html for css includes
							var cssInc;
							if (!(cssInc = context.cssInc)) {
								cssInc = [];
							}
							var styles = '';
							for (var i=0;i<cssInc.length;i++) {
								styles += '\n<link rel="stylesheet" href="'+addTo+filePort+'/'+cssFolder+'/'+cssInc[i]+'" type="text/css" />'
							}	

							// include bottom layout, end response
							fs.readFile(viewStr+bottomInc, function (err, html) {
								if (err) { res.write(err);} else { 
									body+=html;
									var temp = body.toString();
									temp = temp.replace(cssRegex,styles);
									temp = temp.replace(scriptsRegex,scripts);
									temp = temp.replace(fileRegex,addTo+filePort);
									temp = temp.replace(ioRegex,addTo+ioPort);
									res.write(temp);
								}
								res.end();
							});
						}
					});

				}
			});
		}
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
