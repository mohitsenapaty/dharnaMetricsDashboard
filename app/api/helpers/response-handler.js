let responseConstant = require('../constants/response');
let sprintf = require('sprintf-js').sprintf;

module.exports = {
    friendlyName: 'Http Response module to send response to end users',

    description: 'Return a formatted http response based on input parameter includes error messages.',

    inputs: {
        err : {
            type: 'ref',
            description: 'error parameters',
            required: false
        },
        errorCode : {
            type: 'number',
            description: 'Either a success object or error code',
            required: false
        },
        errorObject : {
            type: 'ref',
            description : 'To generate dynamic string',
            required: false
        },
        errorResponse: {
            type: 'ref',
            description : 'To generate dynamic string',
            required: false
        },
        successObject : {
            type: 'ref',
            description: 'Pass a success Object that the user is going to receive',
            required: false
        },
        successCode : {
            type : 'number',
            description: 'Pass a success code which maps to a http code',
            required: false
        },
        stackTrace : {
            type : 'ref',
            description: 'Stack Trace of Error',
            required: false
        }
    },
    exits : {
        error : {

        },
        success : {
            
        }
    },
    fn : async (inputs, exits) => {
        if (inputs.err || inputs.errorCode){
            //calling stackdriver for error reporting
            if (inputs.stackTrace) {
                let r = await sails.helpers.errorReporting.with({'stackTrace':inputs.stackTrace});
            }
            exits.success(mapErrortoResponse(inputs.errorCode, inputs.errorObject, inputs.errorResponse));
        } else {
            exits.success(await mapSuccesstoResponse(inputs.successObject, inputs.successCode));
        }
    }
}

let mapErrortoResponse = (err, errorObj, errorResponse) => {
    let errorCode = Object.entries(responseConstant.errorCodes).find(e => e[1] === err);
    if (errorCode) {
        let errorCodeDesc = responseConstant.error[errorCode[0]];
        let errorDesc = responseConstant.errorMsg[errorCode[0]];
        if (errorObj)
            errorDesc = sprintf(errorDesc, errorObj);
        let httpCode = responseConstant.errorToHttpStatusMap[errorCode[0]];
        if (!httpCode)
            httpCode = responseConstant.errorToHttpStatusMap.Exception;
        return new Object({'error' :{
                'error_code' : err,
                'error_code_desc': errorCodeDesc,
                'error_message' : errorDesc
            },
            'status': httpCode,
            'response': errorResponse
        });
    } else {
        return new Object({'error' :{
                'errorCode': err
            },
            'status': httpConstant.codes.BAD_REQUEST,
            'response': null
        })
    }
}

let mapSuccesstoResponse = async (obj, code) => {
    let successCode = Object.entries(responseConstant.successCodes).find(e => e[1] === code);
    let httpCode = responseConstant.successToHttpStatusMap[successCode[0]];
    let message = responseConstant.success[successCode[0]];
    message = await sails.helpers.mustacheParser(message, obj);
    if (!httpCode)
        httpCode = responseConstant.successCodes.Default;
    return new Object({
        'status': httpCode,
        'response': obj,
        'message' : message
    });
}