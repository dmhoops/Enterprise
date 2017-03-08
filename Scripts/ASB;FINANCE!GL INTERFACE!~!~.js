//application submit before for Finance/GL Interface/*/*

var GLIntObj = getGLInterfaceObject(AInfo["Department"]);
if(GLIntObj.status != "CLOSED"){
	cancel = true;
	showMessage = true;
	comment("Please Close Out Interface Record " + GLIntObj.recordid);
}