/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyAssetContract extends Contract {


    async getCurrentUserId(ctx) {

        let id = [];
        id.push(ctx.clientIdentity.getID());
        var begin = id[0].indexOf("/CN=");
        var end = id[0].lastIndexOf("::/C=");
        let userid = id[0].substring(begin + 4, end);
        return userid;
    }
    async getCurrentType(ctx) {

        let userid = await this.getCurrentUserId(ctx);

        if (userid == "admin") {
            return userid;
        }
        return ctx.clientIdentity.getAttributeValue("usertype");
    }

    async patientExists(ctx, patientID) {
        const buffer = await ctx.stub.getState(patientID);
        return (!!buffer && buffer.length > 0);
    }

    async AdmitPatient(ctx, patientID, NameOfPatient, paitentAge) {
        var usertype = await this.getCurrentType(ctx);
        if( usertype != "admin"){
            throw new Error(`YOU DON'T HAVE PARMISSION TO DO THIS ONLY ADMIN CAN DO THIS`);
        }
        const Exists = await this.patientExists(ctx, patientID);
        if (Exists) {
            throw new Error(`THIS PATIENT ${patientID} IS ALREADY THERE`);
        }
        const asset = { NameOfPatient, patientID, paitentAge};
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(patientID, buffer);
    }

    async GetPatientInfo(ctx, patientID) {
        const exists = await this.patientExists(ctx, patientID);
        if (!exists) {
            throw new Error(`THIS PATIENT ${patientID} DOES NOT EXISTS`);
        }
        const buffer = await ctx.stub.getState(patientID);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }


    
    async PaitentChackup(ctx,patientID,data1,data2) {
        var usertype = await this.getCurrentType(ctx);
        if( usertype != "Doctor"){
            throw new Error(`YOU DON'T HAVE PARMISSION TO DO THIS ONLY DOCTOR CAN DO THIS`);
        }
        const exists = await this.patientExists(ctx, patientID);
        if(!exists) {
            throw new Error(`THIS PATIENT ${patientID} DOES NOT EXISTS`);
        }

    let data={
      '000-IDENTITY':patientID,
      '001-AGE':data1,
      'problem' :data2
       };

    await ctx.stub.putState(patientID,Buffer.from(JSON.stringify(data)));

    console.log('ADDED TO THE LEDGER SUCCESSFULLY!');

  }
    async PaitentMedicines(ctx,patientID,data1,data2) {
        var usertype = await this.getCurrentType(ctx);
        if( usertype != "Doctor"){
            throw new Error(`YOU DON'T HAVE PARMISSION TO DO THIS ONLY DOCTOR CAN DO THIS`);
        }
        const exists = await this.patientExists(ctx, patientID);
        if(!exists) {
            throw new Error(`THIS PATIENT ${patientID} DOES NOT EXISTS`);
        }
       let data={
      '000-IDENTITY':patientID,
      '001-AGE':data1,
      'Medicines' :data2
       };

    await ctx.stub.putState(patientID,Buffer.from(JSON.stringify(data)));

    console.log('ADDED TO THE LEDGER SUCCESSFULLY!');
       
    }

    async deleteMyAsset(ctx, patientID) {
        var usertype = await this.getCurrentType(ctx);
        if( usertype != "admin"){
            throw new Error(`YOU DON'T HAVE PARMISSION TO DO THIS ONLY DOCTOR CAN DO THIS`);
        }
        const exists = await this.patientExists(ctx, patientID);
        if (!exists) {
            throw new Error(`THIS PATIENT ${paitentID} DOES NOT EXISTS`);
        }
        await ctx.stub.deleteState(patientID);
    }




}

module.exports = MyAssetContract;
