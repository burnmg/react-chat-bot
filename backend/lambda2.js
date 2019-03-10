const cities = ['new york', 'boston']

function elicit_slot(session_attributes, intent_name, slots, slot_to_elicit, message) {
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'ElicitSlot',
            'intentName': intent_name,
            'slots': slots,
            'slotToElicit': slot_to_elicit,
            'message': message
        }
    };
}

function confirm_intent(session_attributes, intent_name, slots, message) {
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'ConfirmIntent',
            'intentName': intent_name,
            'slots': slots,
            'message': message
        }
    };
}

function close(session_attributes, fulfillment_state, message) {
    var response = {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': fulfillment_state,
            'message': message
        }
    };
    return response;
}

function delegate(session_attributes, slots) {
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Delegate',
            'slots': slots
        }
    };
}

function build_validation_result(isvalid, violated_slot, message_content) {
    if (message_content) {
        return {
            'isValid': isvalid,
            'violatedSlot': violated_slot,
            'message': {'contentType': 'PlainText', 'content': message_content}
        };
    }
    else {
        return {
            'isValid': isvalid,
            'violatedSlot': violated_slot,
        };
    }
}

function validate(slots) {
    /*
    if (slots["Date_Time"] && slots["Dining_Time"]) {
        var unixdate = slots["Date_Time"] + "T" + slots["Dining_Time"] + ":00";
        var unixtime = parseInt((new Date(unixdate).getTime() / 1000).toFixed(0));
        var now = parseInt((new Date().getTime() / 1000).toFixed(0));
        if (unixtime - now <= 0 || unixtime - now >= 86400) {
            return build_validation_result(false, "Date_Time", "Sorry, we only support dates between now and one day in the future. Can you choose another date?")
        }
    }*/
    return build_validation_result(true, '', null);
}

function handleGreet(intent_request, callback) {
    const source = intent_request['invocationSource'];
    if (source === 'DialogCodeHook') {
        callback(null, delegate(intent_request['sessionAttributes'], intent_request['currentIntent']['slots']));
    }
    if (source === 'FulfillmentCodeHook') {
        callback(null, close(intent_request['sessionAttributes'], 'Fulfilled', null));
    }

    throw new Error('${intent_name} does not support ${source} hook');
}

function handleDining(intent_request, callback) {
    const source = intent_request['invocationSource'];
    var slots = intent_request['currentIntent']['slots'];
    if (source === 'DialogCodeHook') {
        var validateres = validate(slots);
        if (!validateres['isValid']) {
            slots[validateres.violatedSlot] = null;
            callback(null, elicit_slot(intent_request['sessionAttributes'], intent_request['currentIntent']['name'], 
                slots, validateres.violatedSlot, validateres.message));
        } 
        
        callback(null, delegate(intent_request['sessionAttributes'], intent_request['currentIntent']['slots']));
    }

    if (source === 'FulfillmentCodeHook') {
        var sa = {
            'slots': JSON.stringify(intent_request['currentIntent']['slots']),
        };
        callback(null, close(sa, 'Fulfilled', null));
    }

    throw new Error('${intent_name} does not support ${source} hook');
}

function handleThank(intent_request, callback) {
    const source = intent_request['invocationSource'];
    
    if (source === 'DialogCodeHook') {
        callback(null, delegate(intent_request['sessionAttributes'], intent_request['currentIntent']['slots']));
    }
    
    if (source === 'FulfillmentCodeHook') {
        callback(null, close(intent_request['sessionAttributes'], 'Fulfilled', null));
    }

    throw new Error('${intent_name} does not support ${source} hook');
}

function dispatch(intent_request, callback) {
    const intent_name = intent_request['currentIntent']['name'];
    console.log('intent name: ${intent_name}');

    if (intent_name == 'GreetingIntent')
        handleGreet(intent_request, callback);

    if (intent_name == 'DiningSuggestionsIntent')
        handleDining(intent_request, callback);

    if (intent_name == 'ThankYouIntent')
        handleThank(intent_request, callback);

    throw new Error('Intent with name ${intent_name} not supported');
}

    

exports.handler = (event, context, callback) => {
    // TODO implement
    try {
        console.log(JSON.stringify(event));
        dispatch(event, callback);
    } catch (err) {
        callback(err);
    }
};
