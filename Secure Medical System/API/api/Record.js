/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

var express = require("express");
//var router = express.Router();
//const { Gateway, FileSystemWallet } = require("fabric-network");
//const path = require("path");



const cors = require('cors');
const SUCCESS = 0;
const TRANSACTION_ERROR = 401;
const USER_NOT_ENROLLED = 402;

//  connectionOptions
const utils = require('./Users.js');
var contract;
var username;

utils.connectGatewayFromConfig().then((gateway_contract) => {

    console.log('Connected to Network.');
    contract = gateway_contract;

    //  Setup events and monitor for events from HLFabric
   

}).catch((e) => {
    console.log('Connection exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});

app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    next();
});

app.use(cors());




/*  Purpose:    POST api to register new users with Hyperledger Fabric CA;
 * Note:       After registeration, users have to enroll to get certificates
 *              to be able to submit transactions to Hyperledger Fabric Peer.
 *  Input:      request.body = {username (string), password (string), usertype (string)}
 *  Output:     pwd; If password was "", a generated password is returned in response
 */

app.post('/api/register-user/', (request, response) => {
    console.log("\n api/registeruser ");
    let userId = request.body.userid;
    let userPwd = request.body.password;
    let userType = request.body.usertype;
    let countryname ;
    try
    {
    countryname = request.body.countryname;
    console.log("\n countryname "+ countryname);
    }
    catch (e)
    {
        console.log(e);
    }
    console.log("\n userid: " + userId);
    console.log("\n pwd: " + userPwd);
    console.log("\n usertype: " + userType);

    //  Note: On the UI, only admin sees the page "Manage Users"
    //  So, it is assumed that only the admin has access to this api
    utils.registerUser(userId,userPwd,userType,countryname).then((result) => {
        console.log("\n api/registeruser ");
        response.json(result);
    }, (error) => {
        console.log("\n Error returned from registerUser: " + error);
        console.log("\n api/registeruser ");
        response.json(error);
    });

});  


app.post('/api/enroll-user/', (req, response) => {

    console.log("\n  api/enrollUser ");
    let userId = req.body.userid;
    let userPwd = req.body.password;
    let userType = req.body.usertype;

    console.log("\n userId: " + userId);
    console.log("\n userPwd: " + userPwd);
    console.log("\n userType: " + userType);
   

    utils.enrollUser(userId, userPwd, userType).then(result => {
        console.log("\n result from enrollUser = \n", result)
        console.log("\n api/enrollUser ");
        response.send(result);
    }, error => {
        console.log("\n Error returned from enrollUser: \n" + error);
        console.log("\n api/enrollUser ");
        response.status(500).send(error.toString());
    });

})  


app.get('/api/is-user-enrolled/:id/:type', (req, response) => {

    console.log("\n  api/isUserEnrolled ");
    let userId = req.params.id;
    let usertype = req.params.type;

    console.log("\n userid: " + userId);

    utils.isUserEnrolled(userId,usertype).then(result => {
        console.log("\n result from isUserEnrolled = \n", result)
        console.log("\n api/isUserEnrolled ");
        response.send(result);
    }, error => {
        console.log("\n Error returned from isUserEnrolled: \n" + error);
        console.log("\n api/isUserEnrolled ");
        response.status(500).send(error.toString());
    });

}) 
app.get('/api/users', (req, res) => {
    

    utils.getAllUsers(usertype).then((result) => {
        // process response
        console.log('Process getAllUsers response');
        result.errorCode = 1;
        res.json(result);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error returned function getAllUsers:  ', error);
        res.json(error);
    });
});


app.post('/api/login/:type', (req, res) => {

    let userId = req.body.userid;
    let userPwd = req.body.password;
    let type = req.params.type;

    console.log("in api/login. userId: " + userId + ", userPwd: " + userPwd);

    utils.setUserContext(userId, userPwd,type)
        .then(gateway_contract => {
            // New contract connection
            contract = gateway_contract;
            console.log(contract);
            contract.submitTransaction('getCurrentUserType').then((userType) => {
                console.log("Successfully submitted getCurrentUserType:" + userType);
                var result = {};
                result.errorcode = SUCCESS;  
                result.errormessage = "User " + userId + " is enrolled";
                var tmp = userType.toString();
                result.usertype = tmp;
                res.json(result);
            }, (error) => {  
              //  error in transaction submission
                console.log("ERROR in getCurrentUserType:" + error);
                var result = {};
                result.errorcode = TRANSACTION_ERROR;
                result.errormessage = "Error while invoking transaction in smart contract. ", error;
                
                res.json(result);
            });
        }, error => {  
          //  not enrolled
            var result = {};
            console.log("ERROR in setUserContext:" + error);
            result.errorcode = USER_NOT_ENROLLED;
            result.errormessage = "User is not registered or enrolled. " + error;
            res.json(result);
        });

});

// Retrieve calling user id
app.get('/api/current-user-id', (req, res) => {

    contract.evaluateTransaction('getCurrentUserId').then((result) => {
        // process response
        console.log('Transaction complete.');
        res.json(result.toString());
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    });
});

app.get('/api/current-user-type', (req, res) => {

    contract.evaluateTransaction('getCurrentUserType').then((result) => {
        // process response
        console.log('Transaction complete.');
        res.json(result);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    });
});

app.post('/api/AdmitPatient', (req, res) => {

    console.log("\n  api/AdmitPatient ");
    let UserName = req.body.UserName;
    let PatientID = req.body.PatientID;
    let Name = req.body.Name;
    let userty = req.body.usertype;
    console.log("\n PatientID: " + PatientID);
    console.log("\n Name: " + Name);
    
    
    utils.AdmitPatient(UserName,userty,Name,PatientID)
    .then(result =>{
        res.json({'errorCode':result})
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })
    
    

});

app.post('/api/GetPatientInfo',(req,res) =>{
let UserName = req.body.UserName;
let PatientID = req.body.PatientID;
let usertype = req.body.usertype;
console.log(UserName);
utils.GetStudentInfo(UserName,PatientID,usertype)
    .then(result =>{
        res.json(result)
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })

});

app.post('/api/PatientChackup',(req,res) =>{
  
let UserName  = req.body.UserName;
let PatientID = req.body.PatientID;
let usertype = req.body.usertype;
let Problem = req.body.Problem;

console.log(Problem);


utils.AddGrade(UserName,usertype,PatientID,Problem,JSON.stringify(problem))
    .then(result =>{
        res.json({'errorCode':result})
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })

});


app.post('/afterlogin', (req, res) => {

    let userId = req.body.userid;
    let userPwd = req.body.password;
    let userty = req.body.usertype;

    console.log("in api/login. userId: " + userId + ", userPwd: " + userPwd);

    utils.setUserContext(userId, userPwd,userty)
        .then(gateway_contract => {
            // New contract connection
            contract = gateway_contract;
            contract.submitTransaction('getCurrentUserType').then((userType) => {
                console.log("Successfully submitted getCurrentUserType:" + userType);
                var result = {};
                result.errorcode = SUCCESS;   //  SUCCESS = 0
                result.errormessage = "User " + userId + " is enrolled";
                var tmp = userType.toString();
                console.log("Usertype :"+tmp);
                result.usertype = tmp.substring(1, tmp.length - 1);
                if(tmp == "Admin"){
                	username = userId;
                	return res.send("Admin");
        			
                }
                else if(tmp == "Patient"){
                	console.log("Patient");
                	return res.send("Patient");
                }
                else if(tmp == "Doctor"){
                    console.log("Doctor");
                    return res.send("Doctor");
                }
                else{
                   return res.send("failed");
                }
            }, (error) => {  
              //  error in transaction submission
                console.log("ERROR in getCurrentUserType:" + error);
                var result = {};
                result.errorcode = TRANSACTION_ERROR;
                result.errormessage = "Error while invoking transaction in smart contract. ", error;
                //result.usertype = "";
                res.json(result);
            });
        }, error => {  //  not enrolled
            var result = {};
            console.log("ERROR in setUserContext:" + error);
            result.errorcode = USER_NOT_ENROLLED;
            result.errormessage = "User is not registered or enrolled. " + error;
            res.json(result);
        });

});

app.get('/api/SeeAllPatient',(req,res) =>{
  
let username = req.query.username;
let usertype = req.query.usertype;
console.log(username);
utils.SeeAll(username,usertype)
    .then(result =>{
        res.json(result)
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })

});

const port = process.env.PORT || 3000;
app.listen(port, (error) => {
    if (error) {
        return console.log('Error: ' + err);
    }
    console.log(`Server listening on ${port}`)
});
