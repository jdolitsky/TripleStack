// genius.js client-side include file
var reqNum=0;
var res=[];
function sendIO(action,data,cb) {
	var r=reqNum;
	res[r]=null;
	reqNum++;
	data['resNum']=r;
	data['action']=action;
	s.emit('send',data);
	s.on('receive'+r, function(d) {
		res[r]=d;
		return cb(r,d);
	});	
}
var s;
function initS() {
	s=io.connect('{GENIUS-IO-PORT}');
}
