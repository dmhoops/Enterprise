logDebug("Validating Contact Type");
logDebug("selectedContactType: " + selectedContactType);
if (!selectedContactType) {
	showMessage=true;
	comment("You must select a Type");
	cancel=true;
}

var flagField = Contact.getPeople().getContactTypeFlag();
var refContactType = null;
if (selectedContactType){
	stdChoice = "REF_CONTACT_CREATION_RULES";
	var bizDomScriptResult = aa.bizDomain. getBizDomainByValue(stdChoice,selectedContactType);
	if (bizDomScriptResult.getSuccess()){
		var bizDomainObj = bizDomScriptResult.getOutput();
		refContactType = bizDomainObj.getDescription();	
	}
}
if (refContactType == "I" && flagField != "individual"){
	showMessage=true;
	comment("The selected Type is not valid for this contact");
	cancel=true;
}
if (refContactType == "O" && flagField != "organization"){
	showMessage=true;
	comment("The selected Type is not valid for this contact");
	cancel=true;
}