TripleStack
=========

multi-port web development

Setup:
--------
You must install **Node.js**, as well as the **forever** and **socket.io** modules.

For Node installation instructions, see here: *https://github.com/joyent/node/wiki/Installation*

Make sure everything is up-to-date using this script:
```
curl http://npmjs.org/install.sh | sh
```

Once Node is installed and up-to-date, run the following command to install the modules:
```
npm install -g socket.io forever
```

Clone the source to anywhere on your local machine:
```
git clone https://github.com/jdolitsky/TripleStack.git
```
Enter the TripleStack directory:
```
cd TripleStack
```
Edit the configuration defaults in **triplestack.js**. Most importantly, change the port values defined on lines 10-12 if needed (for example, if port 80 is in use by Apache, you can change this value to 82 etc.):
```js
var httpPort = 80;
var filePort = 81;
var ioPort = 3000;
```

Running:
--------
Make sure Node is in the PATH (edit .profile/.bash_profile or run these commands):
```
which node
export PATH=$PATH:$?
```
In order to start TripleStack, use the forever module:
```
forever start triplestack.js
```
and to stop Triplestack:
```
forever stop triplestack.js
```

How to use:
--------
TripleStack loosely follows MVC conventions.

In **Model/app.js**, define variables for the default model. Always include **jsInc** and **cssInc** as shown below.
```js
var jsInc = [];
var cssInc = [];

var text1 = 'watch me change';
var text2 = 'me too';
```

In **Controller/app.js**, define view functions for the default model. You should also push filenames to the **jsInc** and **cssInc** lists for the JavaScript and CSS files you wish to include.
```js
function index() {
  text1 = 'Welcome to TripleStack';
  text2 = 'Try Me';
  jsInc.push('jquery.min.1.7.2.js','exampleScript.js');
  cssInc.push('styles.css');
}
```

In **View/app.js**, define the view for the index() function defined in **Controller/app.js**.
```html
<h1>
<?js 
// the 'spit' function. puts js string 
// into html output
spit(text1);

?>
</h1>
<div id="myButton"><div id="bText">
<?js 

spit(text2);

?>
</div></div>
<div id="log"></div>
```