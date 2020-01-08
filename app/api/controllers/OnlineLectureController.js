const respMessages = require('../constants/response');

let studentAttentionData = async(req, res) => {
    let response = {};
    try{
        sails.log.error(`Some Unexpected Error Occurred while recording student data :: ${CommonService.util.inspect(err)}`);
        response = await sails.helpers.mobileResponseHandler.with({
            'successCode': respMessages.successCodes.Default
        });
        return res.status(response.status)
            .send(response);
    } catch (err) {
        sails.log.error(`Some Unexpected Error Occurred while recording student data :: ${CommonService.util.inspect(err)}`);
        response = await sails.helpers.mobileResponseHandler.with({
            'errorCode': respMessages.errorCodes.Exception
        });
        return res.status(response.status)
            .send(response);
    }
}

module.exports = {
    studentAttentionData,
}