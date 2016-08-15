var itrCount = 0;

function attachListeners(){
	document.getElementById('testButton').addEventListener('click', startTest);
	document.getElementById('loginButton').addEventListener('click', checkLogin);
	document.getElementById('1').addEventListener('click', numPad);
	document.getElementById('2').addEventListener('click', numPad);
	document.getElementById('3').addEventListener('click', numPad);
	document.getElementById('4').addEventListener('click', numPad);
	document.getElementById('5').addEventListener('click', numPad);
	document.getElementById('6').addEventListener('click', numPad);
	document.getElementById('7').addEventListener('click', numPad);
	document.getElementById('8').addEventListener('click', numPad);
	document.getElementById('9').addEventListener('click', numPad);
	document.getElementById('0').addEventListener('click', numPad);
	document.getElementById('#').addEventListener('click', numPad);
	document.getElementById('*').addEventListener('click', numPad);
	document.getElementById('backspaceButton').addEventListener('click', backspace);
	document.getElementById('clearButton').addEventListener('click', clear);
	document.getElementById('connectButton').addEventListener('click', connect);
	document.getElementById('endCallButton').addEventListener('click', endCallJav);
	document.getElementById('simulateCallButton').addEventListener('click', simulateCall);
	document.getElementById('simulateSecondCallButton').addEventListener('click', simulateSecondCall);
	document.getElementById('udpButton').addEventListener('click', selectUDP);
	document.getElementById('tcpButton').addEventListener('click', selectTCP);
	setCount();
}

function handleMessage(message_event){

	if (message_event != null) {
		var origionalMessage = message_event.data;
		//sets callSign = the first ten chars to see what if statement will be used
		var callSign = origionalMessage.substring(0,10);
		//creates variable OMNoCS (Origional Message, No Call Sign)
		var OMNoCS = origionalMessage.substring(10);

		itrCount++;
		setCount();

		if (callSign === "call_from:"){
			//if the user is already connected to a call, the "connect" and "end call" buttons are changed to "merge" and "deny incoming call"
			var callStatusField = document.getElementById('callStatusField');
			var callStatus = callStatusField.innerHTML;
			if (callStatus.substr(0,9) == "Connected"){
				var connectButton = document.getElementById('connectButton');
				connectButton.disabled = false;
				connectButton.innerHTML = "Merge";
				var endCallButton = document.getElementById('endCallButton');
				endCallButton.innerHTML = "Deny Incoming Call";
				var callStatusField = document.getElementById('callStatusField');
				var oldStatusTxt = callStatusField.innerHTML;
				var statusTxt = oldStatusTxt + " & incoming call from: " + OMNoCS;
				callStatusField.innerHTML = statusTxt;
			}
			else{
				//selects OMNoCS and passes it as the incoming callerID
				var callerID = OMNoCS;
				incomingCall(callerID);
			}
		}

		else if (callSign === "connectNac"){
			var callerID = OMNoCS;
			var callStatusField = document.getElementById('callStatusField');
			callStatusField.innerHTML = "Connected to: " + callerID;
			common.updateStatus("On Call");
		}

		else if (callSign === "mergeCalls"){
			//searches for delimiter in call status text
			var callStatusField = document.getElementById('callStatusField');
			var callStatusText = callStatusField.innerHTML;
			var delimeterPos = callStatusText.search("&");
			if (delimeterPos > 0){
				var noDelimeter = (delimeterPos - 1);
				var currentCall = callStatusText.substring(14, noDelimeter);
				callStatusField.innerHTML = "Connected to: " + currentCall + "; " + OMNoCS;
				var connectButton = document.getElementById('connectButton');
				connectButton.innerHTML = "Connect";
				var endCallButton = document.getElementById('endCallButton');
				endCallButton.innerHTML = "End Call";
			}
			else if (delimeterPos < 0){
				var currentCall = callStatusText.substring(14);
				callStatusField.innerHTML = "Connected to: " + currentCall + "; " + OMNoCS;
			}
			common.updateStatus("On Group Call");
		}

		else if (callSign === "endCallNac"){
			//enables Connect and simulateCall buttons and then updates the Main and Call statuses
			var connectButton = document.getElementById('connectButton');
			connectButton.disabled = false;
			var simulateCallButton = document.getElementById('simulateCallButton');
			simulateCallButton.disabled = false;
			var simulateSecondCallButton = document.getElementById('simulateSecondCallButton');
			simulateSecondCallButton.disabled = false;
			var callStatusField = document.getElementById('callStatusField');
			callStatusField.innerHTML = "NO-STATUS";
			common.updateStatus('Call Ended');
		}

		else if (callSign === "newDecline"){
			//removes declined call info from the call status field, updates status, and resets simulateSecondCallButton
			var callStatusField = document.getElementById('callStatusField');
			var oldStatusTxt = callStatusField.innerHTML;
			var statusDelimiter = oldStatusTxt.search("&");
			var statusTxt = oldStatusTxt.substr(0, statusDelimiter);
			callStatusField.innerHTML = statusTxt;
			common.updateStatus("Incoming Call Declined")
			var simulateSecondCallButton = document.getElementById('simulateSecondCallButton');
			simulateSecondCallButton.disabled = false;
		}

		else if (callSign === "radioSelec"){
			radioChoice(OMNoCS);
		}

		else if (callSign === "infoAccept"){
			common.updateStatus("Information Accepted");
			var authNameField = document.getElementById("authNameField");
			authNameField.innerHTML = OMNoCS;
		}

		else if (callSign === "infoReject"){
			common.updateStatus("Incorrect Username or Password");
		}

		else if (callSign === "numReturn_"){
			common.updateStatus("Entered Number");
			var numToDisplay = OMNoCS;
			add(numToDisplay);
		}

		else if (callSign === "testResult"){
			var testResult = OMNoCS;
			if (testResult === "Test Succesful"){
				common.updateStatus("Test Succesful");
				var startEl = document.getElementById('testButton');
				startEl.disabled = false;
			}

		}
	}
}

function startTest(){
	if (common.naclModule) {
		var startEl = document.getElementById('testButton');
		startEl.disabled = true;
		common.updateStatus('Running Test');
		common.naclModule.postMessage("testModule");
	}
}

function numPad(e){
  if (common.naclModule) {
	  var numPressed = "numRecieve" + e.target.innerHTML
	  common.naclModule.postMessage(numPressed);
  }
}

function checkLogin(){
	//concatonates username and password with a delimeter and sends to Nacl module
	if (common.naclModule) {
		var usernameinput = document.getElementById('usernameinput');
		var passwordinput = document.getElementById('passwordinput');
		common.naclModule.postMessage("checkLogin" + usernameinput.value + ">=" + passwordinput.value);
	}
}

function add(text){
    var numberDisplay = document.getElementById("numberpadentry");
    numberDisplay.value = numberDisplay.value + text;
}

function backspace(){
	var numpadentry = document.getElementById("numberpadentry");
    numpadentry.value = numpadentry.value.substring(0, numpadentry.value.length - 1);
}

function clear(){
	var numpadentry = document.getElementById("numberpadentry");
	numpadentry.value = numpadentry.value.substring(0,0);
}

function connect(){
	//first checks that there is no incoming call or that the user is already on a call by checking the first 10 chars of the call status
	var callStatusField = document.getElementById('callStatusField');
	var callStatusText = callStatusField.innerHTML;
	var checkCall = callStatusText.substring(0,10);
	var delimeterCheck = callStatusText.search("&");
	if (checkCall === "Incoming C"){
		common.naclModule.postMessage("connectJav" + callStatusText.substring(19));
	}
	else if (delimeterCheck > 0){
		var currentCall = callStatusText.substring((delimeterCheck + 26));
		common.naclModule.postMessage("mergeCalls" + currentCall);
	}
	else if (checkCall === "Connected "){
		var numberToCall = document.getElementById('numberpadentry');
		if (numberToCall.value === ""){
			common.updateStatus("Please Enter A Valid Number");
		}
		else{
			common.naclModule.postMessage("mergeCalls" + numberToCall.value);
		}
	}
	else if (checkCall === "NO-STATUS"){
		//if the user is not on a call numberToCall is posted to the module and the connect button is disabled to prevenet the user from
		//calling multiple times
		var numberToCall = document.getElementById('numberpadentry');
		if (numberToCall.value === ""){
			common.updateStatus("Please Enter A Valid Number");
		}
		else{
			common.naclModule.postMessage("connectJav" + numberToCall.value);
			var callStatusField = document.getElementById('callStatusField');
			callStatusField.innerHTML = "Calling " + numberToCall.value;
			common.updateStatus("Outgoing call");
		}
	}
}

function endCallJav(){
	//function first checks if user has a call incoming, if not, function ends current call
	var callStatusField = document.getElementById('callStatusField');
	var callStatusText = callStatusField.innerHTML;
	var incomingReject = (callStatusText.search("&")> -1);
	if(incomingReject > 0){
		var callStatusReject = (incomingReject + 26);
		var rejectWho = callStatusText.substr(callStatusReject);
		var rejectMessage = 'endCallJav' + "newDecline" + rejectWho;
		common.naclModule.postMessage(rejectMessage);
		var connectButton = document.getElementById('connectButton');
		connectButton.innerHTML = "Connect";
		var endCallButton = document.getElementById('endCallButton');
		endCallButton.innerHTML = "End Call";
	}
	else{
		common.naclModule.postMessage('endCallJav');
	}
}

function incomingCall(callerID){
	var callStatusField = document.getElementById('callStatusField');
	var CallStatusText = "Incoming Call from " + callerID;
	callStatusField.innerHTML = CallStatusText;
	var connectButton = document.getElementById('connectButton');
}

function simulateCall(){
	var simulateCallButton = document.getElementById('simulateCallButton');
	simulateCallButton.disabled = true;
	common.updateStatus('Simulating Incoming Call');
	common.naclModule.postMessage('testNacCal' + 'NaClModule');
}

function simulateSecondCall(){
	var simulateSecondCallButton = document.getElementById('simulateSecondCallButton');
	simulateSecondCallButton.disabled = true;
	common.updateStatus('Simulating Additional Incoming Call');
	common.naclModule.postMessage('testNacCal' + 'NaClModule');
}

function selectUDP(){
	common.naclModule.postMessage('radioSelec' + "UDP");
}

function selectTCP(){
	common.naclModule.postMessage('radioSelec' + "TCP");
}

function radioChoice(radioType){
	var radioSelectField = document.getElementById('radioSelectField');
	radioSelectField.innerHTML = radioType;
}

function setCount(){
  countEl = document.getElementById('count');
  countEl.textContent = itrCount;
}
