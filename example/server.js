const express = require('express');
const fileUpload = require('../lib/index');
const app = express();
const fs = require('fs');
const PORT = 8000;
const readline = require('readline');
const bodyParser = require('body-parser');

// Static Files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use(bodyParser.urlencoded({ extended: true })); 
// Set Views
app.set('views', './views')
app.set('view engine', 'ejs')

//***************Read Content to Array***************//

function toArray(uploadPath) {
   var array = fs.readFileSync(uploadPath).toString().split("\n");
   return array;
 }
 function toArrayR(uploadPath) {
   var array = fs.readFileSync(uploadPath).toString().split("\r");
   return array;
 }
 function getOrg(orgPath) {
   var array = fs.readFileSync(orgPath).toString().split("\r\n");
   return array;
 }

//***************Search for Cracked***************//

function search(array_1,array_2) {
  // Match 0th of array_1 with 0th or array_2 3rd
  var f_array = [];
  var f_ele = [];
  for (let i = 0; i < array_1.length; i++){ //for array_1
    f_names = [];
    f_ele = [];
    for (let j = 0; j < array_2.length; j++){ // for array_2
      if(array_1[i][0] == array_2[j][3]){
        // Change the LM hash to the cracked value and push
        // array_2[j][3] = array_1[i][1]
        // f_names.push(array_2[j][0].split("\\")[0]);
        f_ele.push(array_2[j][0]);
        f_ele.push(array_2[j][1]);
        f_ele.push(array_2[j][2]);
        f_ele.push(array_1[i][1]);
        // console.log(f_ele);
        f_array.push(f_ele);
      }
    }
  }
  return f_array;
 }

//***************To get class***************//
 function getClass(f_names,category) {
  var cat = [];
  if(category == "All")
  {
    for (i in f_names)
      {
        cat.push("table-row");
      }
  }
  else{
    for (i in f_names){
      if(f_names[i] == category){
        cat.push("table-row");
      }
      else{
        cat.push("none");
      }
    }
  }
  

    return cat;
 }

//***************To get Names***************//
function getNames(f_array) {
  var names = [];
  // console.log(f_array);
  for (i in f_array)
      {
        names.push(f_array[i][0].split("\\")[0]);
      }
      return names;
      // console.log(names);
 }

//***************To upload file***************//
app.get('/cform', (req, res) => {
    res.render('cform')
});

app.get('/ucform', (req, res) => {
    res.render('ucform')
})
// default options
app.use(fileUpload());

//***************File added to the upload folder***************//
app.post('/cupload', function(req, res) {
  let sampleFile;
  let uploadPath;
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }
  //console.log('req.files >>>', req.files); // eslint-disable-line
  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + '/cracked-files/' + sampleFile.name;
  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    appendPath = __dirname + '/main/cracked.txt'
    var array = toArray(uploadPath);
    // Append to Path
    for (i in array){
      fs.appendFileSync(appendPath, array[i]);
    }
    // fs.appendFileSync(appendPath, "\r\n");
    fs.appendFileSync(appendPath, "\r");
    res.send('File uploaded to ' + uploadPath);
  });
});

//***************File added to the upload folder***************//
app.post('/ucupload', function(req, res) {
  let sampleFile;
  let uploadPath;
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }
  //console.log('req.files >>>', req.files); // eslint-disable-line
  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + '/uncrackedd-files/' + sampleFile.name;
  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    appendPath = __dirname + '/main/uncracked.txt'
    var array = toArray(uploadPath);
    // Append to Path
    for (i in array){
      fs.appendFileSync(appendPath, array[i]);
    }
    // fs.appendFileSync(appendPath, "\r\n");
    fs.appendFileSync(appendPath, "\r");

    res.send('File uploaded to ' + uploadPath);
  });
});

//***************To get cracked data***************//
app.get('/cdata', (req, res) => {
  let file1 = __dirname + '/main/cracked.txt';
  var array = toArrayR(file1);
  array = Array.from(new Set(array)); 

  let split_array=[]
  for(i in array){
    split_array.push(array[i].split(":"));
  }

  res.render('cdata', {array:split_array});
});

//***************To get cracked data***************//
app.get('/ucdata', (req, res) => {
  let file2 = __dirname + '/main/uncracked.txt';
  var array = toArrayR(file2);
  array = Array.from(new Set(array));
  // console.log(array);

  let split_array=[]
  for(i in array){
    split_array.push(array[i].split(":"));
  }
  res.render('ucdata', {array:split_array});
});

//***************Get data in proper format***************//
app.get('/format', (req, res) => {

  let file1 = __dirname + '/main/cracked.txt';
  var array_1 = toArrayR(file1);
  array_1 = Array.from(new Set(array_1));

  let split_array1=[]
  for(i in array_1){
    split_array1.push(array_1[i].split(":"));
  }


  let file2 = __dirname + '/main/uncracked.txt';
  var array_2 = toArrayR(file2);
  array_2 = Array.from(new Set(array_2));
  
  let split_array2=[]
  for(i in array_2){
    split_array2.push(array_2[i].split(":"));
  }
  
  var f_array = [];
  var f_class = [];
  let orgPath = __dirname + '/organisations.txt';
  var org = getOrg(orgPath);
  console.log(org);
  res.render('format', {array1:split_array1, array2:split_array2,f_array:f_array,f_class:f_class,org:org});
});


//***************Get common data***************//
app.post('/format', (req, res) => {

  let file1 = __dirname + '/main/cracked.txt';
  var array_1 = toArrayR(file1);
  
  array_1 = Array.from(new Set(array_1));
  

  let split_array1=[]
  for(i in array_1){
    split_array1.push(array_1[i].split(":"));
  }

  let file2 = __dirname + '/main/uncracked.txt';
  // var array_2 = fs.readFileSync(file2).toString().split("\r");
  var array_2 = toArrayR(file2);
  array_2 = Array.from(new Set(array_2));

  let split_array2=[]
  for(i in array_2){
    split_array2.push(array_2[i].split(":"));
  }

  var f_array = search(split_array1,split_array2);
  // console.log(f_array);
  let appendfile3 = __dirname + '/main/common.txt';
    for (i in f_array){
      fs.appendFileSync(appendfile3, f_array[i].join(":"));
      fs.appendFileSync(appendfile3, "\n");
    }

    var f_names = getNames(f_array);
    // console.log("Names",f_names);
    // console.log(req.body.selectpicker);
    category = req.body.selectpicker;

    var f_class = getClass(f_names,category);
    // console.log(f_class);
    let orgPath = __dirname + '/organisations.txt';
    var org = getOrg(orgPath);
  res.render('format', {array1:split_array1, array2:split_array2,f_array:f_array,f_class:f_class,org:org});
});

//***************Add data***************//

app.get('/add', (req, res) => {
  res.render('add');
});

app.post('/add', (req, res) => {
  console.log(req.body.oname);
  let o = "\r\n" + req.body.oname
  res.send('Added!');
  let orgPath = __dirname + '/organisations.txt';
      fs.appendFileSync(orgPath,o);
});

//***************Server Listening***************//
app.listen(PORT, function() {
  console.log('Express server listening on port:', PORT); // eslint-disable-line
});