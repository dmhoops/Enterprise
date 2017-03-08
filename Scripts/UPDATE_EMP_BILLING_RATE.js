//update employee billing rate by David Cao

//Script Name: UPDATE_EMP_BILLING_RATE

var userName = aa.env.getValue("userName");
var billingRate = aa.env.getValue("billingRate");
aa.userright.updateUserProfileValue(userName, 'Billing Rate', billingRate, 'ADMIN');