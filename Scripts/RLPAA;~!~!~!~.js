// Add the LP to a standard choice for syncing
logDebug("License Sequence Number: " + LicenseModel.getLicSeqNbr());
var currentDate = new Date();
addLookup4Sync("license_sync",LicenseModel.getLicSeqNbr().toString(),currentDate.toString());


function addLookup4Sync(stdChoice,stdValue,stdDesc) 
	{
	//check if stdChoice and stdValue already exist; if they do, don't add
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	if (bizDomScriptResult.getSuccess())
		{
		logDebug("Standard Choices Item "+stdChoice+" and Value "+stdValue+" already exist.  Editing it...");
		var bizObj = bizDomScriptResult.getOutput();
		bizObj.setAuditStatus("A");
		bizObj.setBizdomainValue(stdValue);
		bizObj.setDescription(stdDesc);
		var bizDomScriptResult = aa.bizDomain.editBizDomain(bizObj.getBizDomain());
		}

	//Proceed to add
	var strControl;
	
	if (stdChoice != null && stdChoice.length && stdValue != null && stdValue.length && stdDesc != null && stdDesc.length)
		{
		var bizDomScriptResult = aa.bizDomain.createBizDomain(stdChoice, stdValue, "A", stdDesc)

		if (bizDomScriptResult.getSuccess())

			//check if new Std Choice actually created



			logDebug("Successfully created Std Choice(" + stdChoice + "," + stdValue + ") = " + stdDesc);
		else
			logDebug("**ERROR creating Std Choice " + bizDomScript.getErrorMessage());
		}
	else
		logDebug("Could not create std choice, one or more null values");
	}

