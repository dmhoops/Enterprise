/*------------------------------------------------------------------------------------------------------/
| Program : ACA Page Flow Template.js
| Event   : ACA Page Flow Template
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var useCustomScriptFile = true;  			// if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}

if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}

eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));


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


var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code
var parentId = cap.getParentCapID();

// page flow custom code begin


try {
	peopleResult = aa.people.createPeopleModel();
	newPMObj = peopleResult.getOutput().getPeopleModel();

	newPMObj.setBusinessName("TEST Building");
	//newPMObj.setTradeName("t"); // removed on 05/10/2016
	newPMObj.setContactType("Agent");
	//newPMObj.setCharterDate("12/22/2016");
	//newPMObj.setBusinessStructure("Corporation For-Profit");
	newPMObj.setServiceProviderCode(aa.getServiceProviderCode());
	
	// instantiate a CapContactModel
	var ccm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactModel").getOutput();
	// update the peoplemodel on the new object
	ccm.setCapID(capId);
	ccm.setPeople(newPMObj);
	
	//Create the capContact and get the sequence number
	//aa.people.createCapContact(ccm);
	//var capContactID = ccm.getContactSeqNumber();

	//Get Template
	
	// contact ASI
	// This is the ASI Group Name that is tied to the contact type
	var tm = aa.genericTemplate.getTemplateStructureByGroupName("APPLICANT").getOutput();
	if (tm)      {
				  var templateGroups = tm.getTemplateForms();
				  var gArray = new Array();
				  
				  if (!(templateGroups == null || templateGroups.size() == 0)) {
				  		 var subGroups = templateGroups.get(0).getSubgroups();
						 for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
							   var subGroup = subGroups.get(subGroupIndex);
							   var fields = subGroup.getFields();
							   for (var fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
									  var field = fields.get(fieldIndex);
									  //aa.print("Contact Template: " + field.getDisplayFieldName()) 
									  //aa.print("Contact Tempalte Value: " + field.getDefaultValue());
									  
									  //test the attribute label to confirm you are updating right attribute
									if (String(field.getDisplayFieldName()) == "Attribute"){
										//aa.print("HERE");
										field.setDefaultValue("General Partnership"); //Set the Attribute Value						  
									}
							   }
						 }
				  }
			
		
			//set the generic Template on the contact
		    newPMObj.setTemplate(tm);
	}
    //newPMObj.setContactAddressList();
	
	// add the address
	var conAdd = aa.address.createContactAddressModel().getOutput().getContactAddressModel();
	conAdd.setEntityType("CAP_CONTACT");
	//conAdd.setEntityID(parseInt(capContactID));
	conAdd.setPrimary("Y");
	conAdd.setAddressType("Mailing Address"); 
	conAdd.setAddressLine1("100 Main St ");
	conAdd.setCountryCode("US");
	conAdd.setCity("Testville");
	conAdd.setState("CA");
	conAdd.setZip("00000");
	// Add the address to an array
	var tmpList = aa.util.newArrayList();
	tmpList.add(conAdd);
	
	// update the contact address list to array
	peop = ccm.getPeople();
	peop.setContactAddressList(tmpList);
		
	// update the capModel with new CapContactModel
	cap.setApplicantModel(ccm);
  
	
} catch (err) {
	handleError(err, "Page Flow Script");
}



// page flow custom code end


if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
} else {
	if (cancel) {
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	} else {
		aa.env.setValue("ErrorCode", "0");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	}
}
