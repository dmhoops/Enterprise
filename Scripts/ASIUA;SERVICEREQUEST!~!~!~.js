/* Create work order if needed */
try {
	if (AInfo['Create Work Order'] == "CHECKED") {
		woType = AInfo['Work Order Type'];
		if (woType && woType != "") {
			childArr = getChildren(woType);
			if (!childArr || childArr.length == 0) {
				woTypePieces = String(woType).split('/');
				if (woTypePieces.length == 4) {
					createWorkOrder(woTypePieces[1], woTypePieces[2], woTypePieces[3]);
				}	
				else { logDebug("Invalid work order type"); }
			}
		}
	}

}
catch (err) {
	logDebug("Error creating work order" + err.message);
	logDebug(err.stack);
}


function createWorkOrder(woType, woSubType, woCategory) {

	var grp = "AMS";

	var appCreateResult = aa.cap.createApp(grp,woType,woSubType,woCategory,capName);
	if (appCreateResult.getSuccess()) {
		var newId = appCreateResult.getOutput();
		logDebug("cap " + grp + "/" + woType + "/" + woSubType + "/" + woCategory + " created successfully ");
		
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);

		aa.asset.cloneAssets(cap.getCapModel(), newId);

		copyParcels(capId, newId);
		copyAddresses(capId, newId);
		copyOwner(capId, newId);
		copyContacts(capId, newId);
		
		// associate work order to service request
		var linkResult = aa.cap.createAppHierarchy(capId, newId);
		if (linkResult.getSuccess())
			logDebug("Successfully linked");
		else
			logDebug( "**ERROR: linking to " + linkResult.getErrorMessage());

		return newId;	
	}
	else {
		logDebug( "**ERROR: creating work order: " + appCreateResult.getErrorMessage());
	}
	return null;
}