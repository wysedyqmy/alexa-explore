/**
 * Handler for Amazon Alexa.
 * SAMPLE EVENT:
 *
 {
   "session": {
     "sessionId": "SessionId.baae4592-3194-463d-a1bf-a4cea0622913",
     "application": {
       "applicationId": "amzn1.ask.skill.647acd60-f1e7-4f77-9d5e-90c4a4cdfd76"
     },
     "attributes": {},
     "user": {
       "userId": "amzn1.ask.account.AFP3ZWPOS2BGJR7OWJZ3DHPKMOMCKURC2K6A2PLLNCMHBXRN7PSIZJIGE5Y2WGEAVZLBLUK4ZLWURQ2ZOW6WPFLWKVH6XC24ADTVXQULVDJ25JA6T2KU2S6CCJKBMMBDJWB7B5PILJABBQCW6R4X5NRHBVTDGYSLXJWZ3ICZROKXBOPFJBFLUDGLPGBITLPFBXI4UYMSGV6IWYY"
     },
     "new": true
   },
   "request": {
     "type": "IntentRequest",
     "requestId": "EdwRequestId.55f5f621-00a1-46fe-a0bb-130a58ff94a7",
     "locale": "en-US",
     "timestamp": "2016-10-20T04:56:11Z",
     "intent": {
       "name": "AMAZON.HelpIntent",
       "slots": {}
     }
   },
   "version": "1.0"
 }
 */

var bind = function (fn, me) {
    return function () {
        return fn.apply(me, arguments);
    };
};
var Alexa;
var AlexaResponse;

/**
 * Create Alexa Responses
 */
AlexaResponse = (function () {
    function AlexaResponse() {
    }

    function createSpeechObject(optionsParam) {
        if (optionsParam && optionsParam.type === 'SSML') {
            return {
                type: optionsParam.type,
                ssml: optionsParam['speech']
            };
        } else {
            return {
                type: optionsParam.type || 'PlainText',
                text: optionsParam['speech'] || optionsParam
            };
        }
    }

    function buildSpeechletResponse(options) {
        var alexaResponse = {
            outputSpeech: createSpeechObject(options.output),
            shouldEndSession: options.shouldEndSession
        };

        if (options.reprompt) {
            alexaResponse.reprompt = {
                outputSpeech: createSpeechObject(options.reprompt)
            };
        }
        var returnResult = {
            version: '1.0',
            response: alexaResponse
        };

        if (options.sessionAttributes) {
            returnResult.sessionAttributes = options.sessionAttributes;
        }
        return returnResult;
    }

    function getSSMLResponse(message) {
        return {
            type: 'SSML',
            speech: `<speak> ${message} </speak>`
        };
    }

    AlexaResponse.prototype.ask = function (speechOutput, repromptSpeech) {
        var response = buildSpeechletResponse({
            sessionAttributes: this.attributes,
            output: getSSMLResponse(speechOutput),
            reprompt: getSSMLResponse(repromptSpeech),
            shouldEndSession: false
        });
        return response;
    };

    AlexaResponse.prototype.tell = function (speechOutput) {
        var response = buildSpeechletResponse({
            sessionAttributes: this.attributes,
            output: getSSMLResponse(speechOutput),
            shouldEndSession: true
        });
        return response;
    };

    return AlexaResponse;
})();

/**
 *
 */
Alexa = (function () {
    function Alexa() {
        this.handleEvent = bind(this.handleEvent, this);
        this.handleIntentRequest = bind(this.handleIntentRequest, this);
        this.handleLaunchRequest = bind(this.handleLaunchRequest, this);
    }

    Alexa.prototype.handleLaunchRequest = function (event) {
        var alexaResponse = new AlexaResponse();
        return handleOnLaunch(event.request, event.session, alexaResponse);
    };

    Alexa.prototype.handleIntentRequest = function (event) {
        var intent, alexaResponse;
        intent = event.request.intent.name;
        alexaResponse = new AlexaResponse();
        if (this.intentHandlers[intent] === null || typeof(this.intentHandlers[intent]) === "undefined") {
            intent = "AMAZON.HelpIntent";
        }
        // default
        return this.intentHandlers[intent](event.request.intent, event.session, alexaResponse);
    }

    Alexa.prototype.intentHandlers = {
        "ThankYouIntent": function (intent, session, response) {
            return handleThankYouRequest(intent, session, response);
        },

        "AMAZON.HelpIntent": function (intent, session, response) {
            return handleHelpRequest(response);
        },

        "PartnerDayWebsiteIntent": function (intent, session, response) {
            return handlePartnerDayWebsiteRequest(intent, session, response);
        },

        "PartnerdayPageViewsIntent": function (intent, session, response) {
            return handlePartnerDayPageViewsRequest(intent, session, response);
        },
        "PartnerdayPageViews": function(intent,session,response) {
            return handlePartnerDayPageViewsGeneric(intent,session,response);
        }
    };

    function handleOnLaunch(launchRequest, session, response) {
        var whatInfoPrompt = "What information would you like to retrieve from Adobe Analytics?",
            speechOutput = "Welcome to Adobe Analytics.. Which report suite would you like to use?... Adobe I/O portal, Partnerday Website.",
            repromptOutput = "Please say either Adobe I/O Portal or Partnerday Website.";

        return response.ask(speechOutput, repromptOutput);
    }

    /**
     * Handles the request to use the partnerday website report suite
     */
    function handlePartnerDayWebsiteRequest(intent, session, response) {
        var repromptText = "Currently, I can tell you information about the following metrics: page views";
        var speechOutput = "Ok, using the partner day report suite. How can I help you?";

        return response.ask(speechOutput, repromptText);
    }

    /**
     * Handles the request to use the partnerday website report suite
     */
    function handlePartnerDayPageViewsRequest(intent, session, response) {
        // TODO: make the request to get real data from Adobe Analytics
        var speechOutput = "The total number of page views this month is 3,871.";

        return response.ask(speechOutput);
    }

    /**
     * Handles the request using a custom Slot 'MetricName'
     */
    function handlePartnerDayPageViewsGeneric(intent, session, response) {
        // TODO: make the request to get real data from Adobe Analytics
        var metricName = intent.slots.MetricName; //
        var metricNameVal = " default metric ";
        if (intent.slots.MetricName && intent.slots.MetricName.value) {
            metricNameVal = intent.slots.MetricName.value;
        }
        var speechOutput = "The total number of " + metricNameVal + " this month is 1,231.";

        return response.ask(speechOutput);
    }

    function handleHelpRequest(response) {
        var repromptText = "What information would you like to retrieve from Adobe Analytics?";
        var speechOutput = "I can tell you the latest page view this month"
            + repromptText;

        return response.ask(speechOutput, repromptText);
    }

    function handleThankYouRequest(intent, session, response) {
        // get city re-prompt
        var repromptText = "Say either, email or upload to creative cloud: ";
        var speechOutput = "Serverless is cool, isn't it ?  Goodbye !";

        return response.tell(speechOutput);
    }

    Alexa.prototype.handleEvent = function (event) {
        // differentiate request type: LaunchRequest vs IntentRequest
        var req_type = event.request["type"] || "LaunchRequest";

        if (req_type == "LaunchRequest") {
            return this.handleLaunchRequest(event);
        }

        return this.handleIntentRequest(event);
    };

    return Alexa;
})();

function main(event) {
    console.log('ALEXA Event', event.request.type + '!');

    var alexa = new Alexa();
    return alexa.handleEvent(event);
}
