#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"

namespace {
//const char* const unexpectedInputString = "Unexpected Input";
}


class simpleApiInstance : public pp::Instance {
 public:
  explicit simpleApiInstance(PP_Instance instance)
      : pp::Instance(instance) {}
  virtual ~simpleApiInstance() {}

  virtual void HandleMessage(const pp::Var& var_message) {
	if (!var_message.is_string())
		return;
		//sets the message recieved equal to origionalMessage, then uses callSign (string made up of the first ten chars of the message)
		//to determine which if statement to use and pass related info with OMNoCS (Origional Message, No Call Sign)
		std::string origionalMessage = var_message.AsString();
		std::string callSign = origionalMessage.substr(0,10);
		std::string OMNoCS = origionalMessage.substr(10);
		
		if (callSign == "numRecieve"){
			//handles all numpad messages
			std::string numToReturn = "numReturn_" + OMNoCS;
			PostMessage(numToReturn);
		}
		
		if (callSign == "checkLogin"){
			std::string passwordInput = origionalMessage;
			std::string delimiter = ">=";
			std::string userNameInput = passwordInput.substr(0, passwordInput.find(delimiter));
			//added in a second step since setting the start point to 10 above results in returning the delimeter
			std::string userNameInputNoCS = userNameInput.substr(10);
			size_t pos = 0;
				while ((pos = passwordInput.find(delimiter)) != std::string::npos) {
					userNameInput = passwordInput.substr(0, pos);
					passwordInput.erase(0, pos + delimiter.length());
				}
			//Call Signs for java script side, will use for better error messages later on
			std::string infoAcceptCS = "infoAccept";
			std::string infoRejectCS = "infoReject";
			if (userNameInputNoCS == "croffs11" and passwordInput == "password"){
				PostMessage(infoAcceptCS + "Croffs11");
			}
			else{PostMessage(infoRejectCS);
			}
		}
		
		if (callSign == "testNacCal"){
			std::string testCallCS = "call_from:";
			PostMessage(testCallCS + "NaCl Module");
		}
		
		if (callSign == "radioSelec"){
			PostMessage("radioSelec" + OMNoCS);
		}
		
		if (callSign == "connectJav"){
			std::string numberToCall = OMNoCS;
			std::string naclConnectCS = "connectNac";
			PostMessage("connectNac" + OMNoCS);
		}
		
		if (callSign == "mergeCalls"){
			PostMessage("mergeCalls" + OMNoCS);
		}
		
		if (callSign == "endCallJav"){
			if(OMNoCS.substr(0,10) == "newDecline"){
				std::string OMNoCS2 = OMNoCS.substr(10);
				PostMessage("newDecline" + OMNoCS2);
			}
			else{
				PostMessage("endCallNac" + OMNoCS);
			}
		}
		
		if (callSign == "testModule"){
			std::string testString = "testResultTest Succesful";
			PostMessage(testString);
		}
		
	}
};

class SamsModule : public pp::Module {
 public:
  SamsModule() : pp::Module() {}
  virtual ~SamsModule() {}

  virtual pp::Instance* CreateInstance(PP_Instance instance) {
    return new simpleApiInstance(instance);
  }
};


namespace pp {
	Module* CreateModule() {
		return new SamsModule();
	}
}  // namespace pp
