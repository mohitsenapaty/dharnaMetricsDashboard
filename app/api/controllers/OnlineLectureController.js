const respMessages = require('../constants/response');

let studentAttentionData = async(req, res) => {
    let response = {};
    try{
        console.log(req);
        let lectureid = req.params.lectureid;
        let dataBody = req.body;
        let messageBody = {lectureid: lectureid, dataBody: dataBody};
        await SNSService.publishAttentionData(messageBody);
        //sails.log.error(`Some Unexpected Error Occurred while recording student data :: ${CommonService.util.inspect(err)}`);
        response = await sails.helpers.responseHandler.with({
            'successCode': respMessages.successCodes.Default
        });
        return res.status(response.status)
            .send(response);
    } catch (err) {
        sails.log.error(`Some Unexpected Error Occurred while recording student data :: ${CommonService.util.inspect(err)}`);
        response = await sails.helpers.responseHandler.with({
            'errorCode': respMessages.errorCodes.Exception
        });
        return res.status(response.status)
            .send(response);
    }
}

module.exports = {
    studentAttentionData,
}