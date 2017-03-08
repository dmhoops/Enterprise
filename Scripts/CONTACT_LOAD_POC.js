/*------------------------------------------------------------------------------------------------------/
| Program : Contact POC.js
| Event   : ACA
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
var showMessage = false;						// Set to true to see results in popup window
var showDebug = false;							// Set to true to see debug messages in popup window
var preExecute = "PreExecuteForBeforeEvents"
var controlString = "ACA_ADD_CONTACTS_ON_LOAD";	// Standard choice for control
var documentOnly = false;						// Document Only -- displays hierarchy of std choice steps
var disableTokens = false;						// turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false;			// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false;			// Use Group name when populating Task Specific Info Values
var enableVariableBranching = false;			// Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99;							// Maximum number of std choice entries.  Entries must be Left Zero Padded
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message =	"";							// Message String
var debug = "";								// Debug String
var br = "<BR>";							// Break Tag
var feeSeqList = new Array();						// invoicing fee list
var paymentPeriodList = new Array();					// invoicing pay periods

if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
	}

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));	
eval(getScriptText("INCLUDES_CUSTOM"));


function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);
	return emseScript.getScriptText() + "";	
}


try{

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code
var publicUser = false ;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN" ; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID();					// alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();				// Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/");				// Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var parcelArea = 0;

var estValue = 0; var calcValue = 0; var feeFactor			// Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();	// Calculated valuation
if (valobj.length) {
	estValue = valobj[0].getEstimatedValue();
	calcValue = valobj[0].getCalculatedValue();
	feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
	}

var balanceDue = 0 ; var houseCount = 0; feesInvoicedTotal = 0;		// Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId);			// Detail
if (capDetailObjResult.getSuccess())
	{
	capDetail = capDetailObjResult.getOutput();
	var houseCount = capDetail.getHouseCount();
	var feesInvoicedTotal = capDetail.getTotalFee();
	var balanceDue = capDetail.getBalance();
	}	

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId = " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);
logDebug("parcelArea = " + parcelArea);
logDebug("estValue = " + estValue);
logDebug("calcValue = " + calcValue);
logDebug("feeFactor = " + feeFactor);

logDebug("houseCount = " + houseCount);
logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
logDebug("balanceDue = " + balanceDue);

}
catch (error)
{
	logDebug(error.message);
	showDebug=true;
}
/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

if (preExecute.length) doStandardChoiceActions(preExecute,true,0); 	// run Pre-execution code

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
var checkOk = false;

try{
    var srcCapId = aa.cap.getCapID("DUB15-00000-0006B").getOutput();
    copyLicenseProfessional(srcCapId, capId);
	var aList = aa.util.newArrayList(); //for new people aList.add(people);
  	var peop = aa.people.createPeopleModel().getOutput().getPeopleModel();
	peop.setServiceProviderCode(servProvCode);
	peop.setContactType("Owner");
	peop.setFirstName("Test");
	peop.setLastName("Bunny");  
	
  	if(peop != null){
			 
			 var contactModel = wrapPeopleModel(peop,capId);
			 var capContactID = contactModel.getContactSeqNumber();
			 peop = contactModel.getPeople();
			 peop.setContactAddressList(getTransAddContactList(capContactID));
			 aList.add(contactModel);
			 
			if(!aList.isEmpty()) //add
				cap.setContactsGroup(aList);
  		}
}
catch (error)
{
	logDebug(error.message);
	message = error.message;
	showMessage=true;
	showDebug=true;
	cancel=true;
}

function getTransAddContactList(capContactID){
	var conAdd = aa.address.createContactAddressModel().getOutput().getContactAddressModel();
	conAdd.setEntityType("CAP_CONTACT");
	conAdd.setEntityID(parseInt(capContactID));
	conAdd.setPrimary("Y");
	conAdd.setAddressType("Mailing Address"); 
	conAdd.setAddressLine1("100 Main St ");
	conAdd.setCountryCode("US");
	conAdd.setCity("Testville");
	conAdd.setState("CA");
	conAdd.setZip("00000");

	var tmpList = aa.util.newArrayList();
	tmpList.add(conAdd);
		
	return tmpList;
}


function getRefAddContactList(peoId){
	var conAdd = aa.proxyInvoker.newInstance("com.accela.orm.model.address.ContactAddressModel").getOutput();
	conAdd.setEntityID(parseInt(peoId));
	conAdd.setEntityType("CONTACT");
	var addList =  aa.address.getContactAddressList(conAdd).getOutput();
	var tmpList = aa.util.newArrayList();
	var pri = true;
	for(x in addList){
		if(pri){
			pri=false;
			addList[x].getContactAddressModel().setPrimary("Y"); 
		}
		tmpList.add(addList[x].getContactAddressModel());
	}
		
	return tmpList;
}

function wrapPeopleModel(peopleModel,capIdModel){
	var mod = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactModel").getOutput()
	mod.setPeople(peopleModel);
	mod.setCapID(capIdModel);
	aa.people.createCapContact(mod);  
	return mod;
}

function getRefConByPublicUserSeq(pSeqNum) {
	                
	                var publicUserSeq = pSeqNum; //Public user sequence number
	                var userSeqList = aa.util.newArrayList();
	                userSeqList.add(aa.util.parseLong(publicUserSeq));
	                var contactPeopleBiz = aa.proxyInvoker.newInstance("com.accela.pa.people.ContractorPeopleBusiness").getOutput()
	                var contactors = contactPeopleBiz.getContractorPeopleListByUserSeqNBR(aa.getServiceProviderCode(),userSeqList);
	                
	                if (contactors) {
	                                if (contactors.size() > 0) {
	                                                if (contactors.get(0)) {
	                                                                return contactors.get(0);
	                                                }
	                                }
	                }
	}
	
function validDate(dValue) {
  var result = false;
  dValue = dValue.split('/');
  var patternMM = /^\d{2}$/;
  var patternYYYY = /^\d{4}$/;


  if (dValue[0] < 1 || dValue[0] > 12)
      result = true;

  if (!patternMM.test(dValue[0]) || !patternYYYY.test(dValue[1]))
      result = true;

  if (dValue[2])
      result = true;

  if (result) 
  	return false;
  else
  	return true;
}

function monthYearFuture(dValue) {
	var dateArray = new Array();

	dateArray = dValue.split("/");
	
	if (parseInt(dateArray[1]) > sysDate.getYear())
		return true;

	if (parseInt(dateArray[1]) == sysDate.getYear()) {
		if (parseInt(dateArray[0]) > sysDate.getMonth()) {
			return true;
		}
	}

	return false;
}

function copyLicenseProfessional(srcCapId, targetCapId)
{
	var lpList = aa.util.newArrayList();
	var srcList =  aa.licenseProfessional.getLicensedProfessionalsByCapID(srcCapId).getOutput();
	for (var lp in srcList){
		var lpModel = srcList[lp].getLicenseProfessionalModel();
		lpModel.setCapID(targetCapId);
		lpList.add(lpModel);
	}
	cap.setLicenseProfessionalList(lpList);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/


if (debug.indexOf("**ERROR") > 0)
	{
	aa.env.setValue("ScriptReturnCode", "1");
	aa.env.setValue("ScriptReturnMessage", debug);
	}
else
	{
	aa.env.setValue("ScriptReturnCode", "0");
	if (showMessage) aa.env.setValue("ScriptReturnMessage", message);
	if (showDebug) 	aa.env.setValue("ScriptReturnMessage", debug);
	}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
