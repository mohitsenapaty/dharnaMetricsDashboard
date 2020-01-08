const aws = require('aws-sdk');
const respMessages = require('../constants/response');
aws.config.update({ accessKeyId: sails.config.AWS.accessKey, secretAccessKey: sails.config.AWS.accessSecret });

const sns = new aws.SNS({ region: sails.config.sqs.REGION_MUM });

const publishAttentionData = async (message) => {
    if (sails.config.attentionSendActive && (typeof(sails.config.attentionSendActive) !== 'undefined')) {
        try {
            if(!_.isEmpty(message)) {
                let params = {
                    TopicArn: sails.config.SNS.attentionUrlTest,
                    Message: JSON.stringify(message)
                }
                const publishTextPromise = await sns.publish(params).promise();
                //sails.log.info(`Message published to SNS with message :: ${CommonService.util.inspect(message, {depth: null})} result :: ${CommonService.util.inspect(publishTextPromise)}`)
                return publishTextPromise;
            } else {
                return {err: respMessages.errorCodes.Exception};
            }
        } catch (err) {
            sails.log.error(`Something unexpected error occurred while publishing messages to SNS ::${CommonService.util.inspect(err)} for msg :: ${CommonService.util.inspect(message)}`);
            return {err: respMessages.errorCodes.Exception};
        }
    } else {
        sails.log.info(`Publish Event Not Set in Debug Mode`);
    }
}

module.exports = {
	publishAttentionData
}