aa.env.setValue("userID", "PUBLICUSER2");
aa.env.setValue("ScriptTest", "Y");

var userID = aa.env.getValue("userID");
var scriptTest = aa.env.getValue("ScriptTest");

var getResult = aa.emse.dom.PeopleScript.getSysUserByID(userID.trim());
var itemCap = getResult.getOutput();

if (scriptTest == "Y") printEnv();

function printEnv() {
    var params = aa.env.getParamValues();
    var keys = params.keys();
    var key = null;
    while (keys.hasMoreElements()) {
        key = keys.nextElement();
        eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
        aa.print(key + " = " + aa.env.getValue(key));
    }
}