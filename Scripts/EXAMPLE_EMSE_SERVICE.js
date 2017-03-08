/*
 *  EXAMPLE_EMSE_SERVICE.js - HOTS web services and GovXML
 * 	This javaScript file contains example solutions to the hand out exercises
 *  Exercise 5 - Creating Custom web service using EMSE
 *  Requires Accela Automation 7.3 
 */
var capIdString = aa.env.getValue("RecordId");
var capId = aa.cap.getCapID(capIdString).getOutput();
if(capId == null){
	capId = "Not Found";
}

aa.env.setValue("EXAMPLE_SCRIPT","This is another return");
aa.env.setValue("RecordKey",capId);
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", "OK");