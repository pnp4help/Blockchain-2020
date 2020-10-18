/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

class HospitalContract {

    async getCurrentID(ctx) {

        let ID = [];
        ID.push(ctx.clientIdentity.getID());
        let userid = ID[0].substring(begin + 4, end);
        return userid;
        
    }
    async getCurrentType(ctx) {

        let UserID = await this.getCurrentID(ctx);

        if (UserID == "ADMIN") {
            return UserID;
        }
        const UserType =  await ctx.clientIdentity.getAttributeValue("UserType");
        return UserType;
    }

    async patientExists(ctx, patientID) {
        const buffer = await ctx.stub.getState(patientID);
        return (!!buffer && buffer.length > 0);
    }

    async AdmitPatient(ctx, patientID, NameOfPatient, paitentAge) {
        var usertype = await this.getCurrentType(ctx);
        if( usertype != "ADMIN"){
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


    async PaitentChackup(ctx, problem) {
        var usertype = await this.getCurrentType(ctx);
        if( usertype != "Doctor"){
            throw new Error(`YOU DON'T HAVE PARMISSION TO DO THIS ONLY DOCTOR CAN DO THIS`);
        }
        const exists = await this.patientExists(ctx, problem);
        if(!exists) {
            throw new Error(`THIS PATIENT ${paitentID} DOES NOT EXISTS`);
        }
        var now = new Date();
        const PaitentProblem = {
            date: now.toFormat("DD/MM/YYYY"),
            writer_id: paitentID,
            information: problem,
        }
        record.PaitentProblem.push(PaitentProblem);
        await ctx.stub.putState(patientID, Buffer.from(JSON.stringify(record)));
        return true;
        
    }

    async PaitentMedicines(ctx, medicines) {
        var usertype = await this.getCurrentType(ctx);
        if( usertype != "Doctor"){
            throw new Error(`YOU DON'T HAVE PARMISSION TO DO THIS ONLY DOCTOR CAN DO THIS`);
        }
        const exists = await this.patientExists(ctx, problem);
        if(!exists) {
            throw new Error(`THIS PATIENT ${paitentID} DOES NOT EXISTS`);
        }
        var now = new Date();
        const Medicines = {
            date: now.toFormat("DD/MM/YYYY"),
            writer_id: paitentID,
            MedicinesList: medicines,
        }
        record.Medicines.push(Medicines);
        await ctx.stub.putState(patientID, Buffer.from(JSON.stringify(record)));
        return true;
    }

    async deleteMyAsset(ctx, patientID) {
        var usertype = await this.getCurrentType(ctx);
        if( usertype != "ADMIN"){
            throw new Error(`YOU DON'T HAVE PARMISSION TO DO THIS ONLY DOCTOR CAN DO THIS`);
        }
        const exists = await this.patientExists(ctx, patientID);
        if (!exists) {
            throw new Error(`THIS PATIENT ${paitentID} DOES NOT EXISTS`);
        }
        await ctx.stub.deleteState(patientID);
    }

}

module.exports = HospitalContract;
