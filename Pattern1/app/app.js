'use strict';
const AWS = require('aws-sdk');
const kmsClient = new AWS.KMS({region:'ap-southeast-2'});
const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
var mysql = require('mysql');
const zlib = require('zlib');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const DBHOST = "ppt3yx3vapaj01.cvgtcrewqixd.ap-southeast-2.rds.amazonaws.com"
const DBUSER = "masteradmin"
const DBPASS = "P455w0rd#$%"
const KeyId  = '3ccfef82-f8d7-49f7-acca-8784c2bbd78c';

function encryptData( KeyId, Plaintext ){
  var promise = new Promise(function(resolve,reject){
    kmsClient.encrypt({ KeyId, Plaintext }, (err, data) => {
      if (err) {
        console.log(err)
        reject(err); // an error occurred
      }
      else {
        const { CiphertextBlob } = data;
        resolve ( CiphertextBlob );
      };
    });
  
  });
  return promise;
};

function decryptData( KeyId, CiphertextBlob ){
  var promise = new Promise(function(resolve,reject){
    kmsClient.decrypt({ CiphertextBlob, KeyId }, (err, data) => {
      if (err) {
        console.log(err)
        reject(err); // an error occurred
      }
      else {
        const { Plaintext } = data;
        resolve ( Plaintext.toString() );
      };
    });
  
  });
  return promise;
};



function createDB(){
  var con = mysql.createConnection({host: DBHOST,user: DBUSER,password: DBPASS});
  var promise = new Promise(function(resolve,reject){
    var sql = "CREATE DATABASE IF NOT EXISTS mydb";
    con.query(sql, function (err, result) {
      if (err) {
        reject(err);
      }
      else{
        resolve("database create done");
      }
    });
  });
  return promise;
};

function createTable(){
  var con = mysql.createConnection({host: DBHOST,user: DBUSER,password: DBPASS,database: "mydb"});
  var promise = new Promise(function(resolve,reject){
    var sql = "CREATE TABLE IF NOT EXISTS peoplesecret (name VARCHAR(244) NOT NULL, secret TEXT, PRIMARY KEY (name) )";
    con.query(sql, function (err, result) {
      if (err) {
        reject(err);
      }
      else{
        resolve("table create done");
      }
    });
  });
  return promise;
};

function storeSecret(Payload){
  var con = mysql.createConnection({host: DBHOST,user: DBUSER,password: DBPASS,database: "mydb"});
  var promise = new Promise(function(resolve,reject){
    var sql = "INSERT INTO peoplesecret (name, secret) VALUES ('" + Payload['Name'] + "', '" + Payload['Text'] + "' ) ON DUPLICATE KEY UPDATE name= '"+ Payload['Name']  +"', secret='" +  Payload['Text'] + "'" ;
    con.query(sql, function (err, result) {
      if (err) {
        reject(err);
      }
      else{
        resolve("1 record inserted");
      }
    });
  });
  return promise;
};

function getSecret(Payload){
  var con = mysql.createConnection({host: DBHOST,user: DBUSER,password: DBPASS,database: "mydb"});
  var promise = new Promise(function(resolve,reject){
    var sql = "SELECT secret from peoplesecret WHERE name='"+ Payload['Name'] +"'";
    con.query(sql, function (err, result) {
      if (err) {
        reject(err);
      }
      else{
        if(result.length < 1){
          reject(err);
        } 
        else{
          resolve(result[0].secret);
        }
      }
    });
  });
  return promise;
};


router.post('/encrypt', (req, res) => {
  const Payload = {
    'Name': req.body.Name,
    'Text': req.body.Text
  }
  //var Key = KeyARNPrefix + KeyId

  encryptData(KeyId, Payload['Text'])
  .then(function(response) {
    var encryptedData = response;
    const EncryptedDataBase64Str = zlib.gzipSync(JSON.stringify(encryptedData)).toString('base64');
    Payload['Text'] = EncryptedDataBase64Str
    return Payload;
  })
  .then(function(response) {
    var Payload = response;

    //Prepare Database & Table
    createDB()
    .then(function(res){
        createTable()
        .then(function(res){
          //Insert Record
          storeSecret(Payload)
          .then(function(response){
            console.log(response);
            return response;
          })
          .catch(function(err){
            console.log(err);
          });
        })
        .catch(function(err){
          console.log(err);
        });
    })
    .catch(function(err){
      console.log(err);
    });
    return Payload;
  })
  .then(function(response){   
      //var Payload = response; 
      var splitStr = KeyId.split('/');
      var KmsId = splitStr[1];
      var output = {
        'Message':'Data encrypted and stored, keep your key save',
        'Key' : KmsId 
      };
      res.status(200).send( output );
  })
  .catch(function(err) {
      res.status(400).send( {'Message':'Data encryption failed, check logs for more details' });
  });
});

router.get('/decrypt', (req, res) => {
  const Payload = {
    'Name': req.body.Name,
    'Key': req.body.Key
  }
  


  getSecret(Payload)
  .then(function(response) {
    var secretText = response;
    const originalObj = JSON.parse(zlib.unzipSync(Buffer.from(secretText, 'base64')));
    var buf = Buffer.from(originalObj, 'utf8');
    decryptData(Payload['Key'],buf)
    .then(function(response){
      var output = {
        'Text':response,
      };
      res.status(200).send( output );
    })
    .catch(function(err){
      res.status(400).send( {'Message':'Data decryption failed, make sure you have the correct key' });
    });
    return response;
  })
  .catch(function(err) {
      res.status(400).send( {'Message':'Failed getting secret text, check the user name' });
  });
});




app.use("/",router);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);