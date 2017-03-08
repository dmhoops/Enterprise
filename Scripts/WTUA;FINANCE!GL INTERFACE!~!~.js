//Workflow scripting for GL Interface

if ( wfTask == "Review" && wfStatus == "Refresh Source") {
	showMessage=true;
	comment(">Updating Source");
	logDebug("Checking refreshSourceGL");
	var checkOk = refreshSourceGL(capId);
	if(checkOk){
		comment(">Refreshed Source GL");
	}
	logDebug("Checking refreshSourceGL check " + checkOk);
	
	comment(">Updating Trust");
	logDebug("Checking refreshTrustGL");
	var checkOk = refreshTrustGL(capId);
	if(checkOk){
		comment(">Refreshed Trust GL");
	}
	
	comment(">Processing Transfers");
	var interfaceDt = AInfo["GL Interface Date"]
	processDeptTransfers(interfaceDt);
	comment(">Processed Transfers");
	comment("<br/>");
}

if( wfTask == "Review" && (wfStatus == "Generate Summary" || wfStatus == "Refresh Source") ){
	showMessage=true;
	comment(">Updating Summary");
	logDebug("Checking processSummaryData");
	checkOk = processSummaryData(capId);
	if(checkOk){
		comment(">Processed Summary GL");
	}
	comment("<br/>");
}

if( wfTask == "Review" &&  wfStatus == "Transmit Data"){
	showMessage=true;
	comment(">Updating Summary");
	logDebug("Checking processSummaryData");
	checkOk = processSummaryData(capId);
	if(checkOk){
		comment(">Processed Summary GL");
	}
	comment("<br/>");
	comment("TODO: Transmit to Web Service");
}

