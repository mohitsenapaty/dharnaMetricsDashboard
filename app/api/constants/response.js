var httpConstant = require('./http');
module.exports = {
    errorCodes : {
        Exception : -101,
        InvalidCred : -102,
        SMSFailed : -103,
        CaptchaError : -104,
        DBFetchError : -105,
        InvalidPassword : -106,
        InvalidSession : -107,
        InvalidOTP : -108,
    },
    error : {
        Exception: "E_Server_Exception",
        InvalidCred : 'E_Invalid_Credentials',
        SMSFailed : 'E_SMS_Sending_Failed',
        CaptchaError : 'E_Captcha_Bot_Error',
        DBFetchError : 'E_DB_Error',
        InvalidPassword : 'E_Invalid_Password',
        InvalidSession : 'E_Invalid_Session',
        InvalidOTP : 'E_Invalid_OTP',
    },
    errorMsg : {
        Exception : 'Something Unexpected Happened',
        InvalidCred : `Your details were not found, please contact us at %(support)s if you think this is a mistake`,
        SMSFailed : 'OTP sending failed, please refresh and try again',
        CaptchaError : 'Please refresh and try again, running bots on Rupeek services is against the terms of service',
        DBFetchError : 'DB Fetch error',
        InvalidPassword : 'Invalid password',
        InvalidSession : 'Invalid Session',
        InvalidOTP : 'Invalid OTP',
    },
    errorToHttpStatusMap : {
        Exception : httpConstant.codes.SERVER_ERROR,
        InvalidCred : httpConstant.codes.FORBIDDEN,
        SMSFailed : httpConstant.codes.SERVER_ERROR,
        CaptchaError : httpConstant.codes.FORBIDDEN,
        DBFetchError : httpConstant.codes.SERVER_ERROR,
        InvalidPassword : httpConstant.codes.BAD_REQUEST,
        InvalidSession : httpConstant.codes.FORBIDDEN,
        InvalidOTP : httpConstant.codes.BAD_REQUEST,
    },
    success : {
        Default: "Success",
    },
    successCodes : {
        Default : 200,
    },
    successToHttpStatusMap : {
        Default: 200,
    }
}