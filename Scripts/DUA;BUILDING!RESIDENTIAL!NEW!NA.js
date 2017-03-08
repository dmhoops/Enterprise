/*
var srvProvCode = "ENTERPRISE";
var capId = aa.cap.getCapID("DUB15-00000-0004L").getOutput();
var usrId = "ADMIN";
*/
try {
	showDebug=true; 
	publicOnly = false;
	var docList = documentModelArray.toArray();
	if ((documentUploadedFrom == "ACA" && publicOnly) || !publicOnly){
		for (var doc in docList){
			create_doc_review_activity(capId, docList[doc], "Not Started");
		}
	}
}
catch (e) {
	logDebug("ERROR: " + e);
}
// This function will create an activity when a document is uploaded.
// Takes a capId and a document object
// Standard choices are reuired to control activity assignment
// Doc_Review_Act_Assignment
//    Value is the document Type; Description is either username or 
//    depart to assign the review activity to.
//
function create_doc_review_activity(capId, doc, status){
	var srvProvCode = aa.getServiceProviderCode();
	logDebug("INFO: begin function create_doc_review_activity");
	logDebug("INFO: Dcoument Group " + doc.getDocGroup());
	logDebug("INFO: Dcoument Type " + doc.getDocType());
	logDebug("INFO: Dcoument Category " + doc.getDocCategory());
	//Get document type
	var docType = doc.getDocCategory();
	logDebug("INFO: Creating Activity for document " + docType);

	//get Options from Standard Choices
	var assignmentStr = lookup("Doc_Review_Act_Assignment", docType);

	if (assignmentStr == null || assignmentStr == "" || assignmentStr == undefined) {
		return false;
	}
	
	//Setup User Info
	var usr = "";
	var usrDept = "";
	if (aa.person.getUser(assignmentStr).getSuccess()){		
		usr = aa.person.getUser(assignmentStr).getOutput();
		usrDept = usr.getDeptOfUser();
		usr = usr.getUserID();
	}
	else {
		usrDept = assignmentStr;
	}
	logDebug("INFO: Assign to User " + usr);
	logDebug("INFO: Assign to Department " + usrDept);

	//Setup Dates
	jDate = new java.util.Date();
	var c = new java.util.GregorianCalendar();
	//Set number of days until due here
	c.add(c.DATE, 3);
	var dueDate = new java.util.Date(c.getTime());

	//Setup Activity Object
	var act = aa.activity.getNewActivityModel().getOutput();
	//for (var i in act) aa.print(act[i]);
	act.setActivityName("Document Review");
	act.setActivityDescription("Document Review");
	act.setTaskType("Activity");
	act.setActStatus(status);
	act.setAssignedStaffID(usr);
	act.setAssignedDeptNumber(usrDept);
	act.setInternalOnly("Y");
	act.setPriority("Normal");
	act.setCapID(capId);
	act.setServiceProviderCode(srvProvCode);
	act.setActDate(jDate);
	act.setDueDate(dueDate);
	act.setAuditID("ADMIN");

	//Commit
	aa.activity.createActivity(act); 
}