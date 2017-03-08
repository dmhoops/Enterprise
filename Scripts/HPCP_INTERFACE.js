//uncomment and provide transaction for testing
//aa.env.setValue("TRANSACTIONID",159);

var eTranId = aa.env.getValue("TRANSACTIONID");
eTranId = parseInt(eTranId);

var eMod = aa.proxyInvoker.newInstance("com.accela.aa.finance.cashier.onlinePayment.TransactionModel").getOutput();

eMod.setBatchTransCode(eTranId);
var eTran = aa.finance.getETransaction(eMod,null).getOutput();

var entType = String(eTran[0].getEntityType());
var entId = String(eTran[0].getEntityID());

var module = null;
var capId = null;
var capIDString = null;
var cap = null;

var appTypeResult = null;
var appTypeString = null;
var appTypeArray = null;
var acctId = null;

//output params
var userId = "";
var pass = "";
var clientId = "";
var paymentChannel = null;
var misc = "";

//DETERMINE PAYMENT CHANNEL INFORMATION
if ( entType == "CAP" ){
	module = eTran[0].getModuleName();
	var tCapArr = entId.split("-");
	capId = aa.cap.getCapID(tCapArr[0],tCapArr[1],tCapArr[2]).getOutput();
	capIDString = capId.getCustomID();
	appTypeString = aa.cap.getCapTypeModelByCapID(capId).getOutput();
	
	if(module=="LUEG-APCD"){
		paymentChannel = "J001128";
	}
	else if (module=="LUEG-AWM"){
		switch(appTypeString){
			case "Group/Type/SubType/Category":
			case "Group/Type/SubType/Category1":
				paymentChannel = "T001167";
				break;
			default:
				paymentChannel = "ERROR";
		}
	}
	else{
		paymentChannel = "ERROR";
	}
	
}
else if ( entType == "TrustAccount"){
	var tAcct = aa.trustAccount.getTrustAccountByAccountID(entId).getOutput();
	acctId = tAcct.getLedgerAccount(); 
	switch(acctId) {
	    case "44600.21111":
	       module="LUEG-PDS";
	       paymentChannel = "J001214";
	       break;
	    case "61013 21119":
	        module="LUEG-APCD";
	        paymentChannel = "J001128";
	        break;
	    case "61123.21111":
	    case "61123 21111":
	        module="LUEG-DEH";
	        paymentChannel = "J001162";
	        break;
	    default:
	        module="ERROR"
	}	 
}

//GET DEPARTMENT LEVEL INFORMATION
if(module=="LUEG-APCD"){
	clientId = "1128";
	pass = "SDApcd!1128";		
}
else if(module == "LUEG-PDS"){
	clientId = "1214";
	pass = "";	
}
else if(module == "LUEG-DEH"){
	clientId = "1162";
	pass = "";	
}
else{
	clientId = "ERROR";
	pass = "ERROR";
}


aa.env.setValue("MODULE",module);
aa.env.setValue("CLIENTID",clientId);
aa.env.setValue("TRUSTID",acctId);
aa.env.setValue("RECORDID",capIDString);
aa.env.setValue("PAYMENTCHANNEL",paymentChannel);
aa.env.setValue("USERID",userId);
aa.env.setValue("PASS",pass);