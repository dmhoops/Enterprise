var capId = aa.env.getValue("CapID");
for(x in capId)
	aa.print(x + " : " + capId[x]);

aa.env.setValue("ScriptReturnCode", "1");
aa.env.setValue("ScriptReturnMessage", "TEST");