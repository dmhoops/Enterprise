//This is a set script that will invoice fees for all billable time entries that are in the time group associated with the set

//Initialize the Environment
myCapId = null;
myUserId="ADMIN";
runEvent=false;
/* master script includes */ 
var tmpID = aa.cap.getCapID(myCapId).getOutput();
if(tmpID != null){
	aa.env.setValue("PermitId1",tmpID.getID1());
 	aa.env.setValue("PermitId2",tmpID.getID2()); 	
	aa.env.setValue("PermitId3",tmpID.getID3());
}
aa.env.setValue("CurrentUserID",myUserId); 
var preExecute = "PreExecuteForAfterEvents";
var documentOnly = false;
var SCRIPT_VERSION = 3.0;
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
 	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT");
 	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}
if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA));
	/* force for script test*/
	showDebug = true;
	eval(getScriptText(SAScript,SA));
}
else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
}	
eval(getScriptText("INCLUDES_CUSTOM"));
if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}
var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);
var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";
var doStdChoices = false;
var doScripts = false;
var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;
if (bzr) {
	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");
	doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");
	doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
}

function getScriptText(vScriptName){
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1) servProvCode = arguments[1];
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode,vScriptName,"ADMIN");
		return emseScript.getScriptText() + "";
	}
	catch(err) {
	return "";
	}
}
logGlobals(AInfo);

// Begin MAIN
var SetMemberArray= aa.env.getValue("SetMemberArray");
var setId = aa.env.getValue("SetID");
var theSet = aa.set.getSetByPK(setId).getOutput();
var setName = theSet.getSetTitle();

for(var i=0; i < SetMemberArray.length; i++) {
	var id = SetMemberArray[i];
	capId = aa.cap.getCapID(id.getID1(), id.getID2(),id.getID3()).getOutput();
	assessTimeAccountingFeesForSet(capId,setName);
}

//update the set status to indicate that it was processed
theSet.setSetStatus("Inactive");
aa.set.updateSetHeader(theSet);


//#############################################################################################################
// Helper functions
//#############################################################################################################
function assessTimeAccountingFeesForSet(capId,setName){
	var grpSeq = aa.timeAccounting.getTimeGroupByTimeGroupName(setName).getOutput().getTimeGroupSeq();
	var timeEntriesArr = new Array();
	//get time entries filtered by group
	var timeEnts = aa.timeAccounting.getTimeLogModelByEntity(capId, null, null, null, grpSeq).getOutput();
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

//This function will return the time group name based on the time group sequence number 
function getTimeGroupName(groupSeqNum){
	var grpMod = aa.timeAccounting.getTimeGroupTypeModel().getOutput();
	grpMod.setTimeGroupSeq(groupSeqNum);
	var grps = aa.timeAccounting.getTimeGroupTypeModels(grpMod).getOutput();
	return grps[0].getTimeGroupName();
}