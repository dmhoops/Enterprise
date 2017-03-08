aa.env.setValue("InterfaceDate","11/03/2015");

//GLOBALS
var financeRecord = "Finance/GL Interface/KingCo/NA";
var deptArr = getStandardChoiceHash("GL_INTERFACE_DEPARTMENTS");
var servProvCode = "ENTERPRISE";

//ENVIRONMENT SETUP 
var myCapId = "";
var myUserId = "ADMIN";
var eventName = "Batch";
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = false; // set to true to simulate the event and run all std choices/scripts for the record type.  

/* master script code don't touch */ aa.env.setValue("EventName",eventName); var vEventName = eventName;  var controlString = eventName;  var tmpID = aa.cap.getCapID(myCapId).getOutput(); if(tmpID != null){aa.env.setValue("PermitId1",tmpID.getID1()); 	aa.env.setValue("PermitId2",tmpID.getID2()); 	aa.env.setValue("PermitId3",tmpID.getID3());} aa.env.setValue("CurrentUserID",myUserId); var preExecute = "PreExecuteForAfterEvents";var documentOnly = false;var SCRIPT_VERSION = 3.0;var useSA = false;var SA = null;var SAScript = null;var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 	useSA = true; 		SA = bzr.getOutput().getDescription();	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 	if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }	}if (SA) {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,useProductScript));	/* force for script test*/ showDebug = true; eval(getScriptText(SAScript,SA,useProductScript));	}else {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useProductScript));	}	eval(getScriptText("INCLUDES_CUSTOM",null,useProductScript));if (documentOnly) {	doStandardChoiceActions2(controlString,false,0);	aa.env.setValue("ScriptReturnCode", "0");	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");	aa.abortScript();	}var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";var doStdChoices = true;  var doScripts = false;var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;if (bzr) {	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");	doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");	doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	}	function getScriptText(vScriptName, servProvCode, useProductScripts) {	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();	vScriptName = vScriptName.toUpperCase();	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();	try {		if (useProductScripts) {			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);		} else {			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");		}		return emseScript.getScriptText() + "";	} catch (err) {		return "";	}}logGlobals(AInfo); if (runEvent && typeof(doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString,true,0); } catch (err) { logDebug(err.message) } if (runEvent && typeof(doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g,"\r");  aa.print(z); 

//
// Debug/Message Info
//
showDebug = false;
showMessage = true;


// GL INTERFACE CODE
try {
	
	var overrideDt = aa.env.getValue("InterfaceDate")+"";
	
	//Get the existing finance records for today
	var dt= new Date();
	var mm =  zeroPad(dt.getMonth()+1,2);
	var dd = zeroPad(dt.getDate(),2);
	var interfaceDt = mm +"/" + dd + "/" + dt.getFullYear();
	
	//Allow for back refreshing
	if (overrideDt != "" ){
		interfaceDt = overrideDt;
	}
	comment("GL Batch Process Begin");
	comment("GL Interface Date " + interfaceDt );	
	var vCapListResult = aa.cap.getCapIDsByAppSpecificInfoField("GL Interface Date", interfaceDt).getOutput();
	
	for(var dept in deptArr){
		
		var tCapId = null;
		var tcap = null;
		var tcapStatus = null;
		
		//Look for existing record if found set tCapId because we are updating not creating
		for(var tc in vCapListResult ){
			var tDept = getAppSpecific("Location",vCapListResult[tc].getCapID());			
			if (tDept == dept) {
				comment("Record found for " + dept);
				tCapId = vCapListResult[tc].getCapID();
				tcap = aa.cap.getCap(tCapId).getOutput();
				tcapStatus = tcap.getCapStatus();
				break;
			}
		}
		
		if(tCapId == null){
			//Get the finance date of yesterday
			var financeDt = new Date(interfaceDt);
			financeDt.setDate(financeDt.getDate()-1);
			var fmm =  zeroPad(financeDt.getMonth()+1,2);
			var fdd = zeroPad(financeDt.getDate(),2);
			var financeDtMMDDYYYY = fmm +"/" + fdd + "/" + financeDt.getFullYear();
			
			//Creating the record
			tCapId = createCap(financeRecord,dept + " for " + financeDtMMDDYYYY);
			editAppSpecific("Location",dept,tCapId);
			
			//Get the finance date of yesterday
			var financeDt = new Date(interfaceDt);
			financeDt.setDate(financeDt.getDate()-1);
			var fmm =  zeroPad(financeDt.getMonth()+1,2);
			var fdd = zeroPad(financeDt.getDate(),2);
			var financeDtMMDDYYYY = fmm +"/" + fdd + "/" + financeDt.getFullYear();
			
			editAppSpecific("Finance Date",financeDtMMDDYYYY,tCapId);
			editAppSpecific("GL Interface Date", interfaceDt, tCapId);
			
			comment(">Created Record For " + dept);
		}
		
		if (tcapStatus != "In Review" && tcapStatus != null ){
			comment(">Skipping " + dept + " status = " + tcapStatus);
			continue;
		}
		
		comment(">Updating Source For " + dept);
		logDebug("Checking refreshSourceGL");
		var checkOk = refreshSourceGL(tCapId);
		if(checkOk){
			comment(">Refreshed Source GL");
		}
		logDebug("Checking refreshSourceGL check " + checkOk);
		
		comment(">Updating Trust For " + dept);
		logDebug("Checking refreshTrustGL");
		var checkOk = refreshTrustGL(tCapId);
		if(checkOk){
			comment(">Refreshed Trust GL");
		}
		logDebug("Checking refreshSourceGL check " + checkOk);
		
		
		comment(">Updating Summary For " + dept);
		logDebug("Checking processSummaryData");
		checkOk = processSummaryData(tCapId);
		if(checkOk){
			comment(">Processed Summary GL");
		}
		logDebug("Checking processSummaryData check " + checkOk);
	}
	comment(">Processing Transfers");
	processDeptTransfers(interfaceDt);
	comment(">Processed Transfers");
	comment("GL Batch Process Complete");

	}
catch (err) {
	logDebug("A JavaScript Error occured: " + err.message);
	}
// end user code
aa.env.setValue("ScriptReturnCode", "1"); 	if(showDebug) aa.env.setValue("ScriptReturnMessage", debug); if(showMessage){  aa.env.setValue("ScriptReturnMessage", message);}