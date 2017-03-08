//              Testing script by davidcao

//aa.env.setValue("ALT_ID", "DUB15-00000-00017");
aa.env.setValue("ScriptTest", "N");

var alt_id = aa.env.getValue("ALT_ID");

var getCapResult = aa.cap.getCapID(alt_id.trim());
var itemCap = getCapResult.getOutput();

aa.env.setValue("ID1", itemCap.ID1);
aa.env.setValue("ID2", itemCap.ID2);
aa.env.setValue("ID3", itemCap.ID3);

if (aa.env.getValue("ScriptTest") == "Y") printEnv();

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