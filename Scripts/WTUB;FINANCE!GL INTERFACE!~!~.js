if( wfTask == "Review" &&  wfStatus == "Transmit Data" && (AInfo["Deposit Date"] == null || AInfo["Depsoit Date"]=="" )){
	cancel = true;
	showMessage = true;
	comment("Please add Deposit Date record prior to transmit");
}