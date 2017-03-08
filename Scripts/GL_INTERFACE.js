var DEPARTMENT = aa.env.getValue("DEPARTMENT");
var RECORDID = aa.env.getValue("RECORDID");
var ACTION = aa.env.getValue("ACTION");
var USE_PRODUCT_SCRIPTS = (aa.env.getValue("PRODUCT_SCRIPTS") == "Y")

var tmpID = aa.cap.getCapID(RECORDID).getOutput();
if (tmpID != null) {
	aa.env.setValue("PermitId1", tmpID.getID1());
	aa.env.setValue("PermitId2", tmpID.getID2());
	aa.env.setValue("PermitId3", tmpID.getID3());
}

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,false));
logger("Loaded Functions","DEBUG");
eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,false));
logger("Loaded Globals","DEBUG");
eval(getScriptText("INCLUDES_CUSTOM",null,USE_PRODUCT_SCRIPTS));
logger("Loaded Custom","DEBUG");

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

function logger(vmsg,lvl){
	returnStatus += vmsg + "/n";
}

/***
 * GL_INTERFACE ENTRY
 *  
 * */
try{
	var capId = aa.cap.getCapID(RECORDID).getOutput();
	var capIDString = capId.getCustomID();
	var cap = aa.cap.getCap(capId).getOutput();
	var returnStatus = "fail";
	
	if (ACTION=="NEW"){
		handleNewGLSetup(DEPARTMENT);
		//setGLInterfaceObject("NS",GLRecord);
	}
}
catch(err){
	logger("Main Loop Error: " + err);
}

aa.env.setValue("GL_RETURN_STATUS",returnStatus);

/**
 * Runs on ASA for GL Interface
 */
function handleNewGLSetup(dept){
	var GLRecord = getGLInterfaceObject(dept);
	//SETUP ASI
	var endTimeStamp = js_mm_dd_yyyy_hh_mm_ss();
	editAppSpecific("Start Datetime",GLRecord.end);
	editAppSpecific("End Datetime",endTimeStamp);
	
	
	GLRecord.recordid = capIDString;
	GLRecord.status = "OPEN";
	GLRecord.start = GLRecord.end;
	GLRecord.end = endTimeStamp;
	
	//UPDATE THE TRACKING OBJECT
	setGLInterfaceObject(dept,GLRecord);
	
	//loadGLInterfaceTables
	//loadGLInterfaceTables(dept,glObject);
}

//TODO: NEEDS TESTING
function handleGLRefresh(dept){
	var returnValue = true;
	
	var GLRecord = getGLInterfaceObject(dept);
	if(GLRecord.recordid == capIDString){
		logDebug("Refreshing record data")
		//RESET TO OPEN STATUS
		GLRecord.status = "OPEN";
		
		//UPDATE THE END DATE
		var endTimeStamp = js_mm_dd_yyyy_hh_mm_ss();
		editAppSpecific("End Datetime",endTimeStamp);
		GLRecord.end = endTimeStamp;
		
		//UPDATE THE TRACKING OBJECT
		setGLInterfaceObject(dept,GLRecord);
		//loadGLInterfaceTables
		loadGLInterfaceTables(dept,glObject);
	}
	else{
		logDebug("Open record does not match current record")
		returnValue = false;
	}
	return returnValue;
}


//TODO: NEEDS TESTING
/**
 * Loads the ASITables with the cashier session & detail info
 * @param dept
 * @param glObject
 */
function loadGLInterfaceTables(dept, glObject){
	removeASITable("CASHIERSESSION");
	removeASITable("DETAIL");
	
	try{
		var SERV_PROV_CODE = aa.getServiceProviderCode();
		var FROM_DATE = glObject.start;
		var TO_DATE = glObject.end;

		var cashArr = getCashierArray(SERV_PROV_CODE,FROM_DATE,TO_DATE);
		var auditArr = new Array();
		
		var cashierASIT = new Array();
		var cashierASITIndex = 0;
		//Iterate through Cashier Sessions and filter as needed
		for (c in cashArr){
			if(cashArr[c]["CASHIER_ID"] == dept){
				cashierASIT[cashierASITIndex] = new Array();
				cashierASIT[cashierASITIndex]["Session Number"] = cashArr[c]["SESSION_NUMBER"];
				cashierASIT[cashierASITIndex]["Cashier ID"] = cashArr[c]["CASHIER_ID"];
				cashierASIT[cashierASITIndex]["User Name"] = cashArr[c]["USER_NAME"];
				cashierASIT[cashierASITIndex]["Session Start"] = cashArr[c]["SESSION_START_TIME"];
				cashierASIT[cashierASITIndex]["Session End"] = cashArr[c]["SESSION_END_TIME"];
				cashierASITIndex++;
			} 
		} // end cashier loop
		
		var arrTransmit = new Array();
		var arrIndex = 0;
		for(cs in cashierASIT){
			var auditArr = getAuditTrailDetails(SERV_PROV_CODE, cashierASIT[cs]["Session Number"]);
			for (x in auditArr){
				
				arrTransmit[arrIndex]=new Array();
				arrTransmit[arrIndex]["COAID"] = auditArr[x]["GF_L1"];
				arrTransmit[arrIndex]["COLLECTIONDTE"] = auditArr[x]["TRAN_DATE"];
				arrTransmit[arrIndex]["PAYMENTDATA"] = auditArr[x]["TRAN_AMOUNT"];
				arrTransmit[arrIndex]["PENALTY AMOUNT"] = "0";
				arrTransmit[arrIndex]["INTEREST AMOUNT"] = "0";
				arrTransmit[arrIndex]["PAYMENT RECEIVED BY"] = auditArr[x]["CASHIER_ID"];
				//TODO: IMPLEMENT PAYMENT METHOD LOOKUP
				arrTransmit[arrIndex]["PAYMENT METHOD"] = auditArr[x]["PAYMENT_METHOD"];
				arrTransmit[arrIndex]["PAYMENT TYPE"] = dept;
				arrTransmit[arrIndex]["TRANSACTION NUMBER"] = auditArr[x]["PAYMENT_SEQ_NBR"];
				
				arrIndex++;
			}
		} // end detail loop
		
		//load asitables
		addASITable("SESSION",cashierASIT);
		addASITable("DETAIL",arrTransmit);
	}
	catch(err){
		//TODO: HANDLE ERRORS	
	}
}


//TODO: NEEDS TESTING
/**
 * Sets the GL Interface Object
 * 
 * @param dept
 * @param glObj
 * @returns {boolean}
 */
function setGLInterfaceObject(dept, glObj) {
	var retValue = true;

	var bdvObj = aa.bizDomain.getBizDomainByValue("GL_INTERFACE_DEPARTMENTS", dept);
	if (bdvObj.getSuccess()) {
		var bdv = bdvObj.getOutput();
		bdv.setDescription(JSON.stringify(glObj));
		var edBdv = aa.bizDomain.editBizDomain(bdv.getBizDomain());
		logDebug("Updated Object for: " + dept);
	} else {
		var newBdv = aa.bizDomain.createBizDomain("GL_INTERFACE_DEPARTMENTS", dept, "A", JSON.stringify(glObj));
		if (newBdv.getSuccess()) {
			logDebug("Created Object for: " + dept);
		} else {
			logDebug("Failed to Add to Queue");
			retValue = false;
		}
	}
	return retValue;
}


//TODO: NEEDS TESTING
/**
 * Gets the Department Object for use with interface
 * 
 * @param dept
 */
function getGLInterfaceObject(dept) {
	var bdvObj = aa.bizDomain.getBizDomainByValue("GL_INTERFACE_DEPARTMENTS", dept);
	var objOut = new GLInterfaceObj();
	if (bdvObj.getSuccess()) {
		var bdv = bdvObj.getOutput();
		var desc = bdv.getDescription()+"";
		if (desc != null && desc != "" && desc != 'null') {
			objOut = JSON.parse(desc);
		} else {
			logDebug("No Object for:" + dept);
		}
	} else {
		logDebug("Failed to get Standard Choice for: " + dept);
	}
	return objOut;
}

/** (TESTED OK)
 * Department Object status = OPEN/CLOSED recordid = Alternate ID start = 
 * "dd/mm/yyyy hh24:mi:ss" end = "dd/mm/yyyy hh24:mi:ss"
 */
function GLInterfaceObj() {
	this.status = "CLOSED";
	this.recordid = "";
	this.start = "01/01/2015 00:00:00";
	this.end = ""
	return this;
}

/**
 * Returns Date in specific format (TESTED OK)
 * @returns {String}
 */
function js_mm_dd_yyyy_hh_mm_ss() {
	  now = new Date();
	  year = "" + now.getFullYear();
	  month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
	  day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
	  hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
	  minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
	  second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
	  return month + "/" + day + "/" + year + " " + hour + ":" + minute + ":" + second;
	}


//TODO: NEEDS TESTING & DEPLOY QUERY
/** 
 * Gets the cashier session closed by date, returns max of 3000 records in 
 * associative array.  Dates are strings in YYYY-MM-DDTHH24:MI:SS format
 * requires Generic Query array Query_GLInt_Cashier
 * 
 * 		SELECT A.SESSION_NBR, B.CASHIER_ID, A.USER_NAME, TO_CHAR(A.SESSION_START_TIME,'MM/DD/YYYY HH24:MI:SS') SESSION_START_TIME, TO_CHAR(A.SESSION_END_TIME,'MM/DD/YYYY HH24:MI:SS') SESSION_END_TIME
		FROM F4CASHIER_SESSION A INNER JOIN PUSER B
			ON A.SERV_PROV_CODE=B.SERV_PROV_CODE
			WHERE A.SERV_PROV_CODE=? 
			AND A.SESSION_END_TIME >= TO_DATE(?, 'yyyy-mm-dd hh24:mi:ss')
			AND A.SESSION_END_TIME <=TO_DATE(?, 'yyyy-mm-dd hh24:mi:ss')
 * 
 * @param agency
 * @param from_date
 * @param to_date
 * @returns object
 */
function getCashierArray(agency, from_date, to_date){
	var returnObj = new Array();
	
	var pars = aa.util.newArrayList();
	pars.add(aa.genericQuery.getParameterModel("AGENCY",agency).getOutput());
	pars.add(aa.genericQuery.getParameterModel("FROM_DATE",from_date).getOutput());
	pars.add(aa.genericQuery.getParameterModel("TO_DATE",to_date).getOutput());
	
	var gqObj = aa.genericQuery.query("Query_GL_Cashier", pars, 0, 3000);
	var arrTransmit = new Array();
	var arrIndex = 0;
	
	if(gqObj.getSuccess()){
		var gq = gqObj.getOutput();
		returnObj = JSON.parse(gq.getResult());
	}
	else{
		throw ("getCashierArray: " + gqObj.getErrorMessage());
	}
	return returnObj;
};


//TODO: NEEDS TESTING & DEPLOY QUERY
/**
 * Gets the cashier session closed by date, returns max of 3000 records in 
 * associative array.  Dates are strings in YYYY-MM-DDTHH24:MI:SS format
 * requires Generic Query array Query_CashCol_BySession
 * 
 * 		SELECT GF_L1,
       TRAN_DATE,
       B1_PER_ID1||'-'||B1_PER_ID2||'-'||B1_PER_ID3 B1_ALT_ID,
       TRAN_AMOUNT,
       CASHIER_ID,
       PAYMENT_METHOD,
       CASHIER_ID,
       PAYMENT_SEQ_NBR||'.'||FEEITEM_SEQ_NBR PAYMENT_SEQ_NBR
  FROM ACCOUNTING_AUDIT_TRAIL A
WHERE (a.ACTION = ? OR ACTION = ?)
   AND SERV_PROV_CODE=?
   AND SESSION_NBR = ?
 * 
 * @param agency
 * @param sessionNbr
 * @returns object
 */
function getAuditTrailDetails(agency, sessionNbr){
	var returnObj = new Array();
	
	var pars = aa.util.newArrayList();
	pars.add(aa.genericQuery.getParameterModel("ACTION_FIRST","Payment Applied").getOutput());
	pars.add(aa.genericQuery.getParameterModel("ACTION_SECOND","Void Payment Applied").getOutput());
	pars.add(aa.genericQuery.getParameterModel("AGENCY",agency).getOutput());
	pars.add(aa.genericQuery.getParameterModel("SESSION_NBR",sessionNbr).getOutput());
	
	var gqObj = aa.genericQuery.query("Query_CashCol_BySession", pars, 0, 3000);
	var arrTransmit = new Array();
	var arrIndex = 0;
	
	if(gqObj.getSuccess()){
		var gq = gqObj.getOutput();
		returnObj = JSON.parse(gq.getResult());
	}
	else{
		throw ("getCashierArray: " + gqObj.getErrorMessage());
	}
	return returnObj;
};
