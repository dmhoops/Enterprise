/*
 * GLOBAL XML VARIABLES
 */

//Base URL for application server, needs to be updated when environment changes
var APP_URL = "http://10.3.6.182:3080/"; 

//SOAP evelope for SSOService Authenticate web method
var SOAP_AUTH = <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.ws.accela.com">
   <soapenv:Header/>
   <soapenv:Body>
      <ser:authenticate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <userId xsi:type="xsd:string">$$USERID$$</userId>
         <ssoSessionId xsi:type="xsd:string">$$SSOID$$</ssoSessionId>
      </ser:authenticate>
   </soapenv:Body>
</soapenv:Envelope>;

//SOAP evelope for SSOService SignOn web method
var SOAP_SIGNON = <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.ws.accela.com">
   <soapenv:Header/>
   <soapenv:Body>
      <ser:signon soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <agencyID xsi:type="xsd:string">$$AGENCY$$</agencyID>
         <userId xsi:type="xsd:string">$$USERID$$</userId>
         <password xsi:type="xsd:string">$$PASSWORD$$</password>
      </ser:signon>
   </soapenv:Body>
</soapenv:Envelope>;

//GovXML System object
var GOVXML_SYSTEM = <System>
	<XMLVersion>GovXML-7.2.0</XMLVersion>
	<ServiceProviderCode>$$AGENCY$$</ServiceProviderCode>
	<Username>$$USERID$$</Username>
	<StartRow>$$STARTROW$$</StartRow> <!-- Optional --> 
	<EndRow>$$ENDROW$$</EndRow> <!-- Optional --> 
	<ApplicationState>$$SSOID$$</ApplicationState>
</System>;

//GovXML InitiateCap
var GOVXML_INITIATECAP = <GovXML xmlns="http://www.accela.com/schema/AccelaOpenSystemInterfaceXML">
<InitiateCAP>
$$SYSTEM$$
<CAPTypeId>
    <Keys>
      <Key>$$GROUP$$</Key>  <!-- Record Group -->
      <Key>$$TYPE$$</Key>  <!-- Record Type -->
      <Key>$$SUBTYPE$$</Key>  <!-- Record Sub Type-->
      <Key>$$CATEGORY$$</Key>  <!-- Record Category-->
    </Keys>
  </CAPTypeId>
  <Name>$$NAME$$</Name> <!-- Application Name -->
  <Description>$$DESCRIPTION$$</Description> <!-- Work Description -->
  <finalizeNow>true</finalizeNow> <!-- Creates the Application -->
</InitiateCAP>
</GovXML>;

//GovXML GetCAPs
var GOVXML_GETCAPS = <GovXML xmlns="http://www.accela.com/schema/AccelaOpenSystemInterfaceXML">
   <GetCAPs>
      $$SYSTEM$$
      <CAPId>
              <Value>$$CAPID$$</Value> <!-- From our InitiateCAP -->
      </CAPId>
  </GetCAPs>
</GovXML> 


var SOAP_TRIGGER = <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/" xmlns:tns="http://service.ws.accela.com" xmlns:types="http://service.ws.accela.com/encodedTypes" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
   <soap:Body soap:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
      <tns:triggerScript>
         <sessionId xsi:type="xsd:string">$$SSOID$$</sessionId>
         <serviceProviderCode xsi:type="xsd:string">$$AGENCY$$</serviceProviderCode>
         <callerId xsi:type="xsd:string">$$USERID$$</callerId>
         <scriptName xsi:type="xsd:string">$$SCRIPT$$</scriptName>
         <params href="#id1"/>
      </tns:triggerScript>
      <soapenc:Array id="id1" soapenc:arrayType="q1:EMSEModel4WS[1]" xmlns:q1="http://model.ws.accela.com">
         <Item href="#id2"/>
      </soapenc:Array>
      <q2:EMSEModel4WS id="id2" xsi:type="q2:EMSEModel4WS" xmlns:q2="http://model.ws.accela.com">
         <key xsi:type="xsd:string">$$KEY$$</key>
         <value xsi:type="xsd:string">$$VALUE$$</value>
      </q2:EMSEModel4WS>
   </soap:Body>
</soap:Envelope>;

