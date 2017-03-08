if( ! isInspFlowActive(inspType,capId) ){
	cancel = true;
        showMessage = true;
	comment(inspType + " cannot be schedule yet due to prior inspections being required");
}


/**
 * Checks if flow is active.  Default to true if no value found in flow
 * @param inspType {string}
 * @param capItem {capIdModel}
 * @returns {Boolean}
 */
function isInspFlowActive(inspType,capItem){
	var inspF = aa.inspection.getInspMilestoneByCapID(capItem).getOutput();
	for(x in inspF){
		if(inspF[x].getInspType() == inspType){
			if(inspF[x].getSdChkLv1() == "Y")
				return true	; //Return true if found no need to continue
			else
				return false; //return false if found no need to continue
		}
	}
	return true; //default true if not found
}