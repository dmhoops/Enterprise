//application submit after for GL_INTERFACE

var glSetup  = handleNewGLSetup(AInfo["Department"]+"");
if(!glSetup[0]){
	showMessage=true;
	comment("Error: " + glSetup[1]);
}