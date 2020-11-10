'use strict';
const AWS = require('aws-sdk');
const kmsClient = new AWS.KMS({region:'ap-southeast-2'});
const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
var mysql = require('mysql');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var con = mysql.createConnection({
  host: "ppt3yx3vapaj01.cvgtcrewqixd.ap-southeast-2.rds.amazonaws.com",
  user: "masteradmin",
  password: "P455w0rd#$%",
});

function encryptData( KeyId, Plaintext ){
  var promise = new Promise(function(resolve,reject){
    kmsClient.encrypt({ KeyId, Plaintext }, (err, data) => {
      if (err) {
        reject(err); // an error occurred
      }
      else {
        const { CiphertextBlob } = data;
        resolve (CiphertextBlob );
      };
    });
  
  });
  return promise;
};

function testDBConnection(con){
  var promise = new Promise(function(resolve,reject){
      con.connect(function(err) {
        if (err){

        }
        else{

        }
  });
  return promise;
};

router.post('/encrypt', (req, res) => {
  const KeyId = 'arn:aws:kms:ap-southeast-2:022787131977:key/3ccfef82-f8d7-49f7-acca-8784c2bbd78c';


  const Plaintext = req.body.Text;
          
  encryptData(KeyId, Plaintext)
  .then(function(response) {
    var encryptedData = response
    return encryptedData
  })
  .then(function(response) {

    //Test Connection


    // var splitStr = KeyId.split('/');
    // var KmsId = splitStr[1];
    // var output = {
    //   'Message':'Data encrypted and stored, keep your key save',
    //   'Key' : KmsId 
    // };

//    res.status(200).send( output );
  })
  .catch(function(err) {
      res.status(400).send( {'Message':'Data encryption failed, check logs for more details' });
  });
});

  // kmsClient.encrypt({ KeyId, Plaintext }, (err, data) => {
  //   if (err) {
  //     console.log(err, err.stack); // an error occurred
  //     res.status(400).send( {'Message':'Data encryption failed, check logs for more details' });
  //   }
  //   else {

  //     // con.connect(function(err) {
  //     //   if (err) throw err;
  //     //   console.log("Connected!");

  //       // con.query("CREATE DATABASE mydb", function (err, result) {
  //       //   if (err) throw err;
  //       //   console.log("Database created");
  //       // });

  //       // var sql = "CREATE TABLE customers (name VARCHAR(255), address VARCHAR(255))";
  //       // con.query(sql, function (err, result) {
  //       //   if (err) throw err;
  //       //   console.log("Table created");
  //       // });

  //       // var sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";
  //       // con.query(sql, function (err, result) {
  //       //   if (err) throw err;
  //       //   console.log("1 record inserted");
  //       // });


  //     });




app.use("/",router);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);