function addLog(text) {
	var time=new Date();
	var t_hr = time.getHours();
	var t_min = time.getMinutes();
	var t_sec = time.getSeconds();
	if (t_hr<10){ t_hr='0'+t_hr;}
	if (t_min<10){ t_min='0'+t_hr;}
	if (t_sec<10){ t_sec='0'+t_hr;}
	$('#log').append('<p><span class="time">'+t_hr+':'+t_min+':'+t_sec+'</span> '+text+'</p>');
	$('#log').scrollTop($('#log')[0].scrollHeight);
}

var canClick=false;
function undisable() {
	canClick=true;
	$('#bText').css('color','#000');
}

$(document).ready(function() {

	setTimeout(function() {
		addLog('Welcome to genius.js');
	},400);
	try {
		// this function is in file genius.js
		initS();	
		setTimeout(function() {
			addLog('Connected to socket.io');
			setTimeout(function() {
				addLog('socket sessionid: '+s.socket.sessionid);
			
				var scripts=document.getElementsByTagName('script');
				var src;
				setTimeout(function() {
					addLog('Scripts loaded:');
					for (var i=0;i<scripts.length;i++) {
						src=scripts[i].src;
						if (src!='') {
							addLog('--- '+src);
						}
					}
					undisable();
				},200);
			},400);
		},800);
	} catch (e) {
		addLog('Could not connect to socket.io');
	}

	$('#myButton').click(function() {
		if (canClick) {
			var a=Math.floor(Math.random()*11);
			var b=Math.floor(Math.random()*11);
			addLog('Chose random numbers '+a+' and '+b+'...');

			var sendData = {a:a,b:b};
			addLog('Requesting server action \'addNums\' with data {a:'+a+',b:'+b+'}');

			// notice a and b are never added on client-side...
			sendIO('addNums', sendData, function(r,d) {
				addLog('Server responded with data {result:'+d.result+'}');
				addLog('Response saved to array \'res\' at index '+r);
				var temp='';
				for (var j=0;j<res.length;j++) {
					temp+='['+j+'] => {result:'+res[j].result+'}';
					if (j<res.length-1) {
						temp+=' ';
					}
				}
				temp+='';
				addLog('res: '+temp);
			});	
		}
	});

});
