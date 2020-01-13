const aws = require('aws-sdk');
aws.config.update({ accessKeyId: sails.config.AWS.accessKey, secretAccessKey: sails.config.AWS.accessSecret });

const sqs = new aws.SQS({ region: sails.config.SQS.REGION_MUM });
const Consumer = require('sqs-consumer');

let lectureData = {};
lectureData['LEC634076786'] = {'a':1};

//Functions to send data
let intervalSendApp;
let setupBroadcast = () => {
    if (sails.config.attentionBroadcastActive && intervalSendApp === undefined){
        intervalSendApp = setInterval( () =>{
            // this function will be called every second
            //sails.log.info(`Print at ${CommonService.util.inspect(CommonService.moment().utc().toString())}`)
            if (!_.isEmpty(lectureData)){
                //if lectures are present
                //get all the keys, broadcast the whole lecture data in the channel
                _.forEach(lectureData, (k, v) => {
                    let room = 'lecture_'+v;
                    sails.sockets.blast(room, k);
                });
            }
        }, 1000);
    }
}

let terminateBroadcast = () => {
    if (intervalSendApp !== undefined)
        clearInterval(intervalSendApp);
}

//functions to handle 1s timers
//runs every 10 mins
let broadCastIntervalSetter;
let stopBroadcastIfIdle = () => {
    //check all lecture objects in lecture data
    //if last updated of a lecture hour > 2 hours, remove the lecture
    broadCastIntervalSetter = setInterval( () =>{
        // this function will be called every second
        //sails.log.info(`Print at ${CommonService.util.inspect(CommonService.moment().utc().toString())}`)
        if (!_.isEmpty(lectureData)){
            //if lectures are present
            
        }
    }, 600000);
}

setupBroadcast();

module.exports = function (sails) {
    return {
        initialize: function (next) {
            if (sails.config.attentionReadActive) {
                sails.log.info(`Listening to lecture data initialized at :: ${CommonService.util.inspect(CommonService.moment().utc().toString())}`);
                let consumerAppList = [];
                let app;
                for (var i = 0; i < sails.config.attentionNumWorkers; i++){
                    app = Consumer.create({
                        queueUrl: sails.config.SQS.attentionUrlTest,
                        handleMessage: async(message, done) => {
                            try {
                                //sails.log.info(`Got a new Message for processing :: ${CommonService.util.inspect(message)}`);
                                let msgBody = JSON.parse(message.Body);
                                let messageFromBody = JSON.parse(msgBody.Message);
                                let msgType = messageFromBody.eventtype;
                                //console.log(messageFromBody); 
                                let lectureid = messageFromBody.lectureid;
                                let dataBody = messageFromBody.dataBody;
                                //fetch lectureObj n studentObj from the lectureData and update all the values
                                let lectureObj = lectureData[lectureid];
                                if (_.isEmpty(lectureObj))
                                    lectureObj = {};
                                let studentObj = lectureObj[dataBody.studentid];
                                if (_.isEmpty(studentObj)){
                                    studentObj = {attentionList:[], avgAttentionCurrent:null, totalAttentionSum: null};
                                    //lectureObj[dataBody.studentid] = studentObj;
                                }
                                console.log(dataBody);
                                let attentionData = dataBody.attentionData;
                                studentObj.attentionList.push(attentionData.val);
                                if (_.isNumber(studentObj.avgAttentionCurrent)){
                                    studentObj.totalAttentionSum += attentionData.val;
                                    studentObj.avgAttentionCurrent = studentObj.totalAttentionSum/studentObj.attentionList.length;
                                } else {
                                    studentObj.totalAttentionSum = attentionData.val;
                                    studentObj.avgAttentionCurrent = attentionData.val;
                                }
                                lectureObj[dataBody.studentid] = studentObj;
                                lectureObj.lastUpdated = CommonService.moment();
                                lectureData[lectureid] = lectureObj;
                                //publish message to devices listening on lectureid depending on 80% tolerance
                                console.log(studentObj);
                            } catch (err) {
                                sails.log.error("Some error occured while processing the message", err);
                            }
                            done();
                        },
                        sqs: sqs
                    });
                    consumerAppList.push(app);
                }
                _.forEach(consumerAppList, app => {
                    app.on('error', (err) => {
                        sails.log.error(`Some Error occurred in listening to the attention data queue :: ${CommonService.util.inspect(err.message)}`);
                    });
                    app.start();
                });    
            }

            return next();
        },
        routes: {

        },
    }
}
