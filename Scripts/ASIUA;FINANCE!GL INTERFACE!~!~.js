
//Perform Updates on save and Process Summary Data
if(capStatus == "In Review"){
	showMessage=true;
	comment(">Processing Transfers");
	var interfaceDt = AInfo["GL Interface Date"]
	processDeptTransfers(interfaceDt);
	comment(">Processed Transfers");
	comment("<br/>");
	
	comment(">Updating Summary");
	logDebug("Checking processSummaryData");
	checkOk = processSummaryData(capId);
	if(checkOk){
		comment(">Processed Summary GL");
	}
	comment("<br/>");
}