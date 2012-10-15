TripleStack
=========

multi-port web development

Setup:
--------
You must install **Node.js**, as well as the **socket.io** module.

For Node installation instructions, see here: <a href="https://github.com/joyent/node/wiki/Installation" target="_blank">https://github.com/joyent/node/wiki/Installation</a>

Make sure everything is up-to-date using this script:
```
curl http://npmjs.org/install.sh | sh
```

Once Node is installed and up-to-date, run the following command to install the socket.io module:
```
npm install -g socket.io
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
To start TripleStack:
```
node triplestack.js
```
To stop TripleStack (and all other Node instances):
```
pkill -9 node
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

In **Controller/app.js**, define view functions for the default model. You should also push filenames to the **jsInc** and **cssInc** lists for the JavaScript and CSS files you wish to include. These files should be stored in the **js** and **css** folders respectively.
```js
function index() {
  text1 = 'Welcome to TripleStack';
  text2 = 'Try Me';
  jsInc.push('jquery.min.1.7.2.js','exampleScript.js');
  cssInc.push('styles.css');
}
```

In **View/app.js**, define the HTML view for the index() function defined in **Controller/app.js**.
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

Notice the code segments in between the `<?js` and `?>`. This is where you can do computation and make use of the variables defined and modified in the model and controller files.

Also notice the `spit()` function being called in these segments. This is a special function that allows you to output text at that point in the view file, which will be added to the final output sent back to the client.

**The resulting HTML output:**
```html
<h1>
Welcome to TripleStack
</h1>
<div id="myButton"><div id="bText">
Try Me
</div></div>
<div id="log"></div>
```
The output is then inserted between the contents of the **View/top.js** and **View/bottom.js** layout files, then sent back to the client as one HTML file.

This page can then be accessed at <a href="http://localhost" target="_blank">http://localhost</a> (or <a href="http://localhost:82" target="_blank">http://localhost:82</a>, for example, if your your httpPort configuration variable is set to 82).


Multiple models:
--------
To create a different page, such as <a href="http://localhost/newpage" target="_blank">http://localhost/newpage</a>, you must create a new file in the Model directory called **newpage.js**, a new file in the Controller directory called **newpage.js** with at least the `index()` function defined, and a new directory in the View folder named **newpage** with at least a default view file named **index.js**.

Following this example, your directory structure should look like so:
```
[Model]
  newpage.js
  app.js
[View]
  [newpage]
     index.js
  app.js
  top.js
  bottom.js
[Controller]
  newpage.js
  app.js
```

To add a second view named 'view2', simply create the `view2()` function in **Controller/newpage.js**...
```js
function index() {
  var viewName = 'index';
  jsInc.push('jquery.min.1.7.2.js','index.js');
  cssInc.push('index_style.css');
}
function view2() {
  var viewName = 'view2';
  jsInc.push('jquery.min.1.7.2.js','view2.js');
  cssInc.push('view2_style.css');
}
```
... and create the new file **View/newpage/view2.js**:
```html
<h1>Current view:<?js spit(viewname);?></h1>
```
This view is then accessible at <a href="http://localhost/newpage/view2" target="_blank">http://localhost/newpage/view2</a>