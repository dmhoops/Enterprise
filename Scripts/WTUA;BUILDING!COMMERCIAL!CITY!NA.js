//time accounting POC from Jim
assignTimeReviewSets(capId);
if (wfTask == "Time Entry Review" && wfStatus == "Approved") {
        assessTimeAccountingFees(capId);
}

//**************************************************************************
// Time Accounting functions
//**************************************************************************

//adds a record to a time accounting review set
function assignTimeReviewSets(capId){
	var timeEntriesArr = new Array();
	var timeGrpsArr = new Array();
	var timeEnts = aa.timeAccounting.getTimeLogModelByEntity(capId, null, null, null, null).getOutput();
	var tlmlIterator = timeEnts.iterator();
	while (tlmlIterator.hasNext()) {
		var timeLogModel = tlmlIterator.next();
		var timeLogSeq = timeLogModel.getTimeLogSeq();
		// we have to get the model again using the seq because	the other function doesn't populate the object fully
		var tResult = aa.timeAccounting.getTimeLogModel(timeLogSeq);
		if (tResult.getSuccess()) {
			var timeLogModel = tResult.getOutput();
			if (timeLogModel != null) {
				if(timeLogModel.getBillable() == "Y" && timeLogModel.getTimeLogStatus()!="L"){
					//add to the array because this group needs review
					var timeGrp = getTimeGroupName(timeLogModel.getTimeGroupSeq());
					timeGrpsArr[timeGrp] = timeGrp;
				}
			}
		}
	}
	//process the array and add to sets
	var setType = "Time Entry Review";
	var jsDate = new Date();
	var year = jsDate.getYear() + 1900;
	for (var g in timeGrpsArr) {
		//Check to see if this group is subject to Review;
		if (typeof lookup("TimeReviewGroups",timeGrpsArr[g]) == "string"){
			//Build set name based on group and date
			var setName = timeGrpsArr[g] + " " + year + "." + getWeekOfYear(jsDate);
			logDebug("Generated set name: " + setName);
			var recSet = new capSet(setName);
			recSet.name = timeGrpsArr[g];
			recSet.type = setType;
			recSet.status = "Active";
			recSet.update();
			if (recSet.members.length==0) {
				logDebug("adding " + capId + " to set");
				var rec = aa.set.addCapSetMember(setName,capId).getOutput();
				recSet.updateMemberStatus(capId,"Active");
			}
			for (var m in recSet.members){
				if (recSet.members[m].getID1() == capId.getID1() && recSet.members[m].getID2() == capId.getID2() && recSet.members[m].getID3() == capId.getID3()){
					logDebug("record is already in the set");
					recSet.updateMemberStatus(capId,"Pending");
				}
				else{
					logDebug("adding " + capId + " to set");
					var rec = aa.set.addCapSetMember(setName,capId).getOutput();
					recSet.updateMemberStatus(capId,"Pending");
				}
			}
		}
	}
}

//This function will return the time group name based on the time group sequence number 
function getTimeGroupName(groupSeqNum){
	var grpMod = aa.timeAccounting.getTimeGroupTypeModel().getOutput();
	grpMod.setTimeGroupSeq(groupSeqNum);
	var grps = aa.timeAccounting.getTimeGroupTypeModels(grpMod).getOutput();
	return grps[0].getTimeGroupName();
}

// Takea a javascript date and returns an int representing the week of the year
function getWeekOfYear(jsDate){
	var target  = new Date(jsDate.valueOf());  
	// ISO week date weeks start on monday  
	// so correct the day number  
	var dayNr   = (jsDate.getDay() + 6) % 7;  
	// Set the target to the thursday of this week so the  
	// target date is in the right year  
	target.setDate(target.getDate() - dayNr + 3);  
	// ISO 8601 states that week 1 is the week  
	// with january 4th in it  
	var jan4    = new Date(target.getFullYear(), 0, 4);  
	// Number of days between target date and january 4th  
	var dayDiff = (target - jan4) / 86400000;
   	// Calculate week number: Week 1 (january 4th) plus the    
	// number of weeks between target date and january 4th    
	var weekNr = 1 + Math.ceil(dayDiff / 7);    
	return weekNr;    
}


function assessTimeAccountingFees(capId){
	var timeEntriesArr = new Array();
	var timeEnts = aa.timeAccounting.getTimeLogModelByEntity(capId, null, null, null, null).getOutput();
	var tlmlIterator = timeEnts.iterator();
	while (tlmlIterator.hasNext()) {
		var timeLogModel = tlmlIterator.next();
        var timeLogSeq = timeLogModel.getTimeLogSeq();
		// we have to get the model again using the seq because	the other function doesn't populate the object fully
		var tResult = aa.timeAccounting.getTimeLogModel(timeLogSeq);
		if (tResult.getSuccess()) {
			var timeLogModel = tResult.getOutput();
			if (timeLogModel != null) {
				if(timeLogModel.getBillable() == "Y" && timeLogModel.getTimeLogStatus()!="L"){
					
					var timeTypeModel = timeLogModel.getTimeTypeModel();
					var timeType = "" + timeTypeModel.getDispTimeTypeName();
					var duration = parseInt(timeLogModel.getTotalMinutes());
					try{
						var feeInfoStr = lookup("TimeTypeToFeeCode",timeType);
						var feeInfoArr = feeInfoStr.split("|");
						var feeSchedule = feeInfoArr[0];
						var feeCode = feeInfoArr[1];
						var feePeriod = feeInfoArr[2];
						var quantity = parseFloat(duration/60);
						logDebug("Fee Schedule:" + feeSchedule + " Fee Code:" + feeCode + " amount: " + quantity);
						var feeSeqNumber = addFee(feeCode, feeSchedule, feePeriod, quantity, "Y", capId);
						timeLogModel.setNotation("Fee " + feeSeqNumber);
						timeLogModel.setTimeLogStatus("L");
						aa.timeAccounting.updateTimeLogModel(timeLogModel);
					}
					catch(lookupErr){
						logDebug("Error assessing fee for time type " + timeType);
						logDebug("    " + lookupErr);
					}
				}
			}	
		}
	}
}



// Time accounting POC from Deanna
if (wfTask == "Permit Issuance" && wfStatus == "Ready to Issue") {
        var timeEntryArray = new Array();
	sumTimeEntriesWFIntoArray(timeEntryArray);
	
	totalHours = 0;
	for (var taskName in timeEntryArray) {
		totalHoursWorked = parseFloat(timeEntryArray["" + taskName]) / 60;
		if (totalHoursWorked == 0) continue;
		totalHours += totalHoursWorked;
	}
	if (totalHours > 0) updateFee("BD_COM002", "BD_COM", "STANDARD", totalHours, "Y");
}