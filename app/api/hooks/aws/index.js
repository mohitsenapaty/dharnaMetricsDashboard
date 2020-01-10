const aws = require('aws-sdk');
aws.config.update({ accessKeyId: sails.config.AWS.accessKey, secretAccessKey: sails.config.AWS.accessSecret });

const sqs = new aws.SQS({ region: sails.config.SQS.REGION_MUM });
const Consumer = require('sqs-consumer');

module.exports = function (sails) {
    return {
        initialize: function (next) {
            if (sails.config.attentionReadActive) {
                sails.log.info(`Listening to sms reminder initialized at :: ${CommonService.util.inspect(CommonService.moment().utc().toString())}`);
                const app = Consumer.create({
                    queueUrl: sails.config.SQS.attentionUrlTest,
                    handleMessage: async(message, done) => {
                        try {
                            sails.log.info(`Got a new Message for processing :: ${CommonService.util.inspect(message)}`);
                            let msgBody = JSON.parse(message.Body);
                            let messageFromBody = JSON.parse(msgBody.Message);
                            let msgType = messageFromBody.eventtype;
                            console.log(messageFromBody); 
                        } catch (err) {
                            sails.log.error("Some error occured while processing the message", err);
                        }
                        done();
                    },
                    sqs: sqs
                });
                app.on('error', (err) => {
                    sails.log.error(`Some Error occurred in listening to the sms reminder queue :: ${CommonService.util.inspect(err.message)}`);
                });
                app.start();
            }
            return next();
        },
        routes: {

        },
    }
}
