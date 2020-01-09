module.exports = function (sails) {
    return {
        initialize: function (next) {
            if (sails.config.smsReminderActive) {
                sails.log.info(`Listening to sms reminder initialized at :: ${CommonService.util.inspect(CommonService.moment().utc().toString())}`);
                const app = Consumer.create({
                    queueUrl: sails.config.SQS.reminderUrl,
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
