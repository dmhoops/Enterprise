

oldId = aa.env.getValue("oldId");
newId = aa.env.getValue("newId");

capId = aa.cap.getCapID(oldId).getOutput();
if (capId != null) {
	res = updateAltID(newId, capId);
} 



function updateAltID(newAltId) {
  itemCap = (arguments.length == 2) ? itemCap = arguments[1] : itemCap = capId
  updateResult = aa.cap.updateCapAltID(itemCap, newAltId)
  if (!updateResult.getSuccess()) {
    return true
  }
  return false
}
