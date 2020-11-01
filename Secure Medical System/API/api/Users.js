var express = require("express");
var router = express.Router();

// Bringing key classes into scope, most importantly Fabric SDK network class
const {
  FileSystemWallet,
  Gateway,
  X509WalletMixin
} = require("fabric-network");
const path = require("path");
const FabricCAServices = require('fabric-ca-client');

var gateway;
var configdata;
var network;
var wallet;
var bLocalHost;
var ccp_org1;
var ccp_org2;
var orgMSPID;
var walletPath;
var contract = null;

const router = {};


router.connectGatewayFromConfig = async () => {
    console.log("Connecting Gateway From Config function");

const configPath =  '../Gateway/config.json';
const configJSON = fs.readFileSync(configPath, 'utf8');
configdata = JSON.parse(configJSON);

// connect to the connection file
const PccpPath = '../Gateway/Fabric_Org1_Connection.json';
const PccpJSON = fs.readFileSync(PccpPath, 'utf8');
ccp_org1 = JSON.parse(PccpJSON);
const AccpPath = '../Gateway/Fabric_Org2_Connection.json';
const AccpJSON = fs.readFileSync(AccpPath, 'utf8');
ccp_org2 = JSON.parse(AccpJSON);



// A wallet stores a collection of identities for use
walletPath = path.join(process.cwd(), '/wallet/Org2');
wallet = new FileSystemWallet(walletPath);
console.log(`Wallet path: ${walletPath}`);


const peerIdentity = 'PatientApp';

    // A gateway defines the peers used to access Fabric networks
    gateway = new Gateway();

     try {

    let response;
    // Check to see if User is already enrolled or not.
    const userExists = await wallet.exists(peerIdentity);
    if (!userExists) {
      console.log('An identity for the user ' + peerIdentity + ' does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      response.error = 'An identity for the user ' + peerIdentity + ' does not exist in the wallet. Register ' + peerIdentity + ' first ';
      return response;
    }

    //connect to Fabric Network and starting a new gateway
    const gateway = new Gateway();
	var userid = process.env.FABRIC_USER_ID || "admin";
        var pwd = process.env.FABRIC_USER_SECRET || "adminpw";
        var usertype = process.env.FABRIC_USER_TYPE || "admin";
        console.log('user: ' + userid + ", pwd: ", pwd + ", usertype: ", usertype);
          // Set up the MSP Id
     orgMSPID = ccp_org2.client.organization;
     console.log('MSP ID: ' + orgMSPID);
    //use our config file, our peerIdentity, and our discovery options to connect to Fabric network.
    await gateway.connect(ccp_org2, { wallet, identity: peerIdentity, discovery: configdata.gatewayDiscovery });
    //connect to our channel that has been created on IBM yash/Internship_projects Platform
    const network = await gateway.getNetwork('mychannel');
    console.log("here");
    //connect to our insurance contract that has been installed / instantiated on IBM yash/Internship_projects Platform
     contract = await network.getContract('Blockchain'); 
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
  }finally{
return contract;
}

}





router.registerUser = async (userid, userpwd, usertype) => {
    console.log("\n Register User ");
    console.log("\n userid: " + userid + ", pwd: " + userpwd + ", usertype: " + usertype)
    let id ;
    let ccp;
    if(usertype == "Patient"){
        id = configdata.PatientappAdmin;
        ccp = ccp_org2;
        walletPath = path.join(process.cwd(), '/wallet/Org2');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);  
    }
    else if(usertype == "Doctor"){
        id = configdata.DoctorAppAdmin;
        console.log(id);
        ccp = ccp_org1;
        walletPath = path.join(process.cwd(), '/wallet/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else{
        return "Invalid Type";
    }
    
    //  Register is done using admin signing authority*/
    var newUserDetails;
        newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        role : "client",
        //affiliation: orgMSPID,
        //profile: 'tls',
        attrs: [
            {
                "name": "usertype",
                "value": usertype,
                "ecert": true
            }],
        maxEnrollments: 6
    };
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: id, discovery: configdata.gatewayDiscovery });
        console.log("Connected");
        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();
        console.log(`AdminIdentity: + ${adminIdentity}`); 

        // Register the user, enroll the user, and import the new identity into the wallet.
    
      console.log(newUserDetails);
    await ca.register(newUserDetails, adminIdentity)
        .then(newPwd => {
            //  if a password was set in 'enrollmentSecret' field of newUserDetails,
            //  the same password is returned by "register".
            //  if a password was not set in 'enrollmentSecret' field of newUserDetails,
            //  then a generated password is returned by "register".
        
            console.log('\n Secret returned: ' + newPwd);
            
            return newPwd;
        }, error => {
            
            console.log('Error in register();  ERROR returned: ' + error);
            
            return error;
        });
} 


router.enrollUser = async (userid, userpwd, usertype) => {
    let ccp;
    let id;
    if(usertype == "Patient"){
        id = configdata.PatientappAdmin;
        ccp = ccp_org2;
        console.log(id);

        walletPath = path.join(process.cwd(), '/wallet/Org2');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);  
    }
    else if(usertype == "Doctor"){
        id = configdata.DoctorAppAdmin;
        ccp = ccp_org1;
        walletPath = path.join(process.cwd(), '/wallet/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else{
        return "Invalid Type";
    }
    console.log("function enrollUser");
    console.log("\n userid: " + userid + ", pwd: " + userpwd + ", usertype:" + usertype);

    // get certification authority
    console.log('Getting CA');
    const orgs = ccp.organizations;
    const CAs = ccp.certificateAuthorities;
    orgMSPID = ccp.client.organization;
    const fabricCAKey = orgs[orgMSPID].certificateAuthorities[0];
    const caURL = CAs[fabricCAKey].url;
    const ca = new FabricCAServices(caURL, { trustedRoots: [], verify: false });
    var newUserDetails;
    newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        role : "client",
        //affiliation: orgMSPID,
        //profile: 'tls',
        attrs: [
            {
                "name": "usertype",
                "value": usertype,
                "ecert": true
            }],
    };

    
    console.log("User Details: " + JSON.stringify(newUserDetails))
    return ca.enroll(newUserDetails).then(enrollment => {
        console.log("\n Successful enrollment; Data returned by enroll", enrollment.certificate);

        var identity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());

        return wallet.import(userid, identity).then(NotUsed => {
            console.log("msg: Successfully enrolled user, " + userid + " and imported into the wallet");
        }, error => {
            console.log("error in wallet.import\n" + error);
            throw error;
        });
    }, error => {
        console.log("Error in enrollment " + error.toString());
        throw error;
    });
}


router.isUserEnrolled = async (userid,usertype) => {
    if(usertype == "Doctor"){
        walletPath = path.join(process.cwd(), '/wallet/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);  
    }
    else if(usertype == "Patient"){
        walletPath = path.join(process.cwd(), '/wallet/Org2');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else{
        return "Invalid Type";
    }
    console.log( "function isUserEnrolled");
    console.log("\n userid: " + userid);

    return wallet.exists(userid).then(result => {
        console.log("is User Enrolled: " + result);
        console.log(" end of function isUserEnrolled ");
        return result;
    }, error => {
        console.log("error in wallet.exists\n" + error);
        throw error;
    });
}


router.getAllUsers = async (usertype) => {
    let id ;
    let ccp;
    if(usertype == "admin"){
        id = configdata.Admin;
        ccp = ccp_cou;
    }
    else{
        return "Invalid Type";
    }
    const gateway = new Gateway();

    // Connect to gateway as admin
    await gateway.connect(ccp, { wallet, identity: id, discovery: configdata.gatewayDiscovery });
    let client = gateway.getClient();
    let fabric_ca_client = client.getCertificateAuthority();
    let idService = fabric_ca_client.newIdentityService();
    let user = gateway.getCurrentIdentity();
    let userList = await idService.getAll(user);
    let identities = userList.result.identities;
    let result = [];
    let tmp;
    let attributes;

    // for all identities
    for (var i = 0; i < identities.length; i++) {
        tmp = {};
        tmp.id = identities[i].id;
        tmp.usertype = "";

        if (tmp.id == "admin")
            tmp.usertype = tmp.id;
        else {
            attributes = identities[i].attrs;
            // look through all attributes for one called "usertype"
            for (var j = 0; j < attributes.length; j++)
                if (attributes[j].name == "usertype") {
                    tmp.usertype = attributes[j].value;
                    break;
                }
        }
        result.push(tmp);
    }

    return result;
}


router.setUserContext = async (userid, pwd,usertype) => {
    console.log('In function: setUserContext ....');

    // It is possible that the user has been registered and enrolled in Fabric CA earlier
    // and the certificates (in the wallet) could have been removed.  
    // Note that this case is not handled here.

    // Verify if user is already enrolled
    if(usertype == "Doctor"){
        walletPath = path.join(process.cwd(), '/wallet/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);  
    }
    else if(usertype == "admin"){
        walletPath = path.join(process.cwd(), '/wallet/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else if(usertype == "Patient"){
        walletPath = path.join(process.cwd(), '/wallet/Org2');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else{
        return "Invalid Type";
    }
    console.log(usertype);
    const userExists = await wallet.exists(userid);
    if (!userExists) {
        console.log("An identity for the user: " + userid + " does not exist in the wallet");
        console.log('Enroll user before retrying');
        throw ("Identity does not exist for userid: " + userid);
    }

    try {
        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway with userid:' + userid);
        let id ;
        let ccp;
    if(usertype == "Doctor"){
        id = configdata.DoctorappAdmin;
        ccp = ccp_org1;
        walletPath = path.join(process.cwd(), '/wallet/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);  
    }
    else if(usertype == "admin"){
        id = configdata.Admin;
        ccp = ccp_org1;
        walletPath = path.join(process.cwd(), '/wallet/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else if(usertype == "Patient"){
        id = configdata.PatientAppAdmin;
        ccp = ccp_org2;
        walletPath = path.join(process.cwd(), '/wallet/Org2');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else{
        return "Invalid Type";
    }
        let userGateway = new Gateway();
        await userGateway.connect(ccp, { identity: userid, wallet: wallet, discovery: configdata.gatewayDiscovery });

        // Access channel
        console.log('Use network channel: ' + configdata["Channel-Name"]);
        network = await userGateway.getNetwork(configdata["Channel-Name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract"]);
        console.log('Userid: ' + userid + ' connected to smartcontract: ' +
            configdata["smart_contract"] + ' in channel: ' + configdata["Channel-Name"]);

        console.log('Leaving the setUserContext Function: ' + userid);
        return contract;
    }
    catch (error) { throw (error); }
}  


router.AdmitPatient = async function(userName,usertype,name,patientID) {
     let id ;
        let ccp;
        console.log(usertype);
        if(usertype == "Doctor"){
            id = configdata.DoctorappAdmin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallet/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);  
        }
        else if(usertype == "admin"){
            id = configdata.Admin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallet/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else if(usertype == "Patient"){
            id = configdata.PatientAppAdmin;
            ccp = ccp_org2;
            walletPath = path.join(process.cwd(), '/wallet/Org2');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else{
            return "Invalid Type";
        }
      try{ 

        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["Channel-Name"]);
        network = await userGateway.getNetwork(configdata["Channel-Name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract"] + ' in channel: ' + configdata["Channel-Name"]);

        await contract.submitTransaction('AdmitPatient', patientID,name);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await userGateway.disconnect();
        return "Transaction completed";

    } catch (error) {
        console.error(` transaction Failed: ${error}`);
        response.error = error.message;
        return response; 
    }
}


router.PaitentChackup = async function(userName,usertype,patientID,Problem){
    try{
         let id ;
        let ccp;
        console.log(usertype);
        if(usertype == "Doctor"){
            id = configdata.DoctorappAdmin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallet/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);  
        }
        else if(usertype == "admin"){
            id = configdata.Admin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallet/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else if(usertype == "Patient"){
            id = configdata.PatientAppAdmin;
            ccp = ccp_org2;
            walletPath = path.join(process.cwd(), '/wallet/Org2');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else{
            return "Invalid Type";
        }
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["Channel-Name"]);
        network = await userGateway.getNetwork(configdata["Channel-Name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
        configdata["smart_contract"] + ' in channel: ' + configdata["Channel-Name"]);
        const result = await contract.submitTransaction('PaitentChackup', patientID, Problem);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return result.toString();

    }catch(error){
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;

    }

}


router.PaitentMedicines = async function(userName,usertype,patientID, Medicines){
    try{
         let id ;
        let ccp;
        console.log(usertype);
        if(usertype == "Doctor"){
            id = configdata.DoctorappAdmin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallet/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);  
        }
        else if(usertype == "admin"){
            id = configdata.Admin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallet/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else if(usertype == "Patient"){
            id = configdata.PatientAppAdmin;
            ccp = ccp_org2;
            walletPath = path.join(process.cwd(), '/wallet/Org2');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else{
            return "Invalid Type";
        }
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["Channel-Name"]);
        network = await userGateway.getNetwork(configdata["Channel-Name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
        configdata["smart_contract"] + ' in channel: ' + configdata["Channel-Name"]);
        const result = await contract.submitTransaction('PaitentChackup', patientID, Medicines);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return result.toString();

    }catch(error){
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;

    }

}


router.GetPatientInfo = async function(userName,patientID,usertype) {

    try {
        let id ;
        let ccp;
        console.log(usertype);
        if(usertype == "Doctor"){
            id = configdata.DoctorappAdmin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallet/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);  
        }
        else if(usertype == "admin"){
            id = configdata.Admin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallet/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else if(usertype == "Patient"){
            id = configdata.PatientAppAdmin;
            ccp = ccp_org2;
            walletPath = path.join(process.cwd(), '/wallet/Org2');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else{
            return "Invalid Type";
        }
        
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["Channel-Name"]);
        network = await userGateway.getNetwork(configdata["Channel-Name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract"] + ' in channel: ' + configdata["Channel-Name"]);
        
        const result = await contract.evaluateTransaction('GetPatientInfo',patientID);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return JSON.parse(result.toString());

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}


router.SEEALLINFO = async function(userName,usertype) {

    try {
        let id ;
        let ccp;
        console.log(usertype);
        if(usertype == "Doctor"){
            id = configdata.DoctorappAdmin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallet/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);  
        }
        else if(usertype == "admin"){
            id = configdata.Admin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallet/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else if(usertype == "Patient"){
            id = configdata.PatientAppAdmin;
            ccp = ccp_org2;
            walletPath = path.join(process.cwd(), '/wallet/Org2');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else{
            return "Invalid Type";
        }
        
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: "Vishruti", discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["Channel-Name"]);
        network = await userGateway.getNetwork(configdata["Channel-Name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract"] + ' in channel: ' + configdata["Channel-Name"]);
        
        const result = await contract.evaluateTransaction('SEEALLINFO');

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return JSON.parse(result.toString());

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

module.exports = router;