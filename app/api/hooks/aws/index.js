const aws = require('aws-sdk');
aws.config.update({ accessKeyId: sails.config.AWS.accessKey, secretAccessKey: sails.config.AWS.accessSecret });

const sqs = new aws.SQS({ region: sails.config.SQS.REGION_MUM });
const Consumer = require('sqs-consumer');

let lectureData = {};
let lectureDataSend = {};


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
                                let lectureObjSend = lectureData[lectureid];
                                if (_.isEmpty(lectureObj)){
                                    lectureObj = {};
                                    lectureObjSend = {};
                                }
                                let studentObj = lectureObj[dataBody.studentid];
                                let studentObjSend = lectureObj[dataBody.studentid];
                                if (_.isEmpty(studentObj)){
                                    studentObj = {
                                        attentionList:[], avgAttentionCurrent:null, totalAttentionSum: null, 
                                        emList: {anger:[], happy:[], sad:[], surprised:[]}, 
                                        emCurrent:{anger:null, happy:null, sad:null, surprised:null}, 
                                        emSum: {anger:null, happy:null, sad:null, surprised:null}
                                    };
                                    studentObjSend = {
                                        attentionSeq: -1, avgAttentionCurrent:null, totalAttentionSum: null, emSeq:-1, 
                                        emCurrent:{anger:[], happy:[], sad:[], surprised:[]},
                                        emSum:{anger:null, happy:null, sad:null, surprised:null}
                                    };
                                };
                                    
                                    //lectureObj[dataBody.studentid] = studentObj;
                                //console.log(dataBody);
                                //calculate attention data
                                let attentionData = dataBody.attentionData;
                                studentObj.attentionList.push(attentionData.val);
                                studentObjSend.attentionSeq = studentObj.attentionList.length;
                                //calculate emotion data
                                let emData = dataBody.emData;
                                studentObj.emList.anger.push(emData.anger);
                                studentObj.emList.happy.push(emData.happy);
                                studentObj.emList.sad.push(emData.sad);
                                studentObj.emList.surprised.push(emData.surprised);
                                if (_.isNumber(studentObj.avgAttentionCurrent)){
                                    studentObj.totalAttentionSum += attentionData.val;
                                    studentObjSend.totalAttentionSum = studentObj.totalAttentionSum;
                                    studentObj.avgAttentionCurrent = studentObj.totalAttentionSum/studentObj.attentionList.length;
                                    studentObjSend.avgAttentionCurrent = studentObjSend.avgAttentionCurrent;
                                    studentObj.emSum.anger += emData.anger;
                                    studentObj.emSum.happy += emData.happy;
                                    studentObj.emSum.sad += emData.sad;
                                    studentObj.emSum.surprised += emData.surprised;
                                    studentObjSend.emSum = studentObj.emSum;
                                    studentObj.emCurrent.anger = studentObj.emSum.anger/studentObj.emList.anger.length;
                                    studentObj.emCurrent.happy = studentObj.emSum.happy/studentObj.emList.happy.length;
                                    studentObj.emCurrent.sad = studentObj.emSum.sad/studentObj.emList.sad.length;
                                    studentObj.emCurrent.surprised = studentObj.emSum.surprised/studentObj.emList.surprised.length;
                                    studentObjSend.emCurrent = studentObj.emCurrent;
                                } else {
                                    studentObj.totalAttentionSum = attentionData.val;
                                    studentObjSend.totalAttentionSum = studentObj.totalAttentionSum;
                                    studentObj.avgAttentionCurrent = attentionData.val;
                                    studentObjSend.avgAttentionCurrent = studentObjSend.avgAttentionCurrent;
                                    studentObj.emSum.anger = emData.anger;
                                    studentObj.emSum.happy = emData.happy;
                                    studentObj.emSum.sad = emData.sad;
                                    studentObj.emSum.surprised = emData.surprised;
                                    studentObjSend.emSum = studentObj.emSum;
                                    studentObj.emCurrent.anger = studentObj.emSum.anger/studentObj.emList.anger.length;
                                    studentObj.emCurrent.happy = studentObj.emSum.happy/studentObj.emList.happy.length;
                                    studentObj.emCurrent.sad = studentObj.emSum.sad/studentObj.emList.sad.length;
                                    studentObj.emCurrent.surprised = studentObj.emSum.surprised/studentObj.emList.surprised.length;
                                    studentObjSend.emCurrent = studentObj.emCurrent;
                                }
                                lectureObj[dataBody.studentid] = studentObj;
                                lectureObjSend[dataBody.studentid] = studentObjSend;
                                lectureObj.lastUpdated = CommonService.moment();
                                lectureData[lectureid] = lectureObj;
                                lectureDataSend[lectureid] = lectureObjSend;
                                //publish message to devices listening on lectureid depending on 80% tolerance
                                console.log(studentObjSend);
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
            if (sails.config.attentionBroadcastActive){
                //Functions to send data
                let intervalSendApp;
                let setupBroadcast = () => {
                    if (sails.config.attentionBroadcastActive && intervalSendApp === undefined){
                        sails.log.info(`Setting up data broadcast at ${CommonService.moment().format()}`);
                        intervalSendApp = setInterval( () =>{
                            // this function will be called every second
                            //sails.log.info(`Print at ${CommonService.util.inspect(CommonService.moment().utc().toString())}`)
                            if (!_.isEmpty(lectureDataSend)){
                                //if lectures are present
                                //get all the keys, broadcast the whole lecture data in the channel
                                _.forEach(lectureDataSend, (k, v) => {
                                    let room = 'lecture_'+v;
                                    console.log(v);
                                    sails.sockets.blast(room, k);
                                });
                            }
                        }, 1000);
                    }
                }

                let terminateBroadcast = () => {
                    sails.log.info(`Terminating data broadcast at ${CommonService.moment().format()}`);
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
                        // this function will be called every x mins, x configured in local.js
                        //  sails.log.info(`Print at ${CommonService.util.inspect(CommonService.moment().utc().toString())}`)
                        let currentTime = CommonService.moment();
                        if (!_.isEmpty(lectureDataSend)){
                            //if lectures are present
                            _.forEach(lectureDataSend, (k, v)=>{
                                if (k.lastUpdated < currentTime.add(-1, 'hours')){
                                    // delete v
                                    sails.log.info(`Broadcast stopped for ${k} at ${currentTime.format()}`)
                                    delete lectureDataSend[v];
                                    delete lectureData[v];
                                }
                            });
                        }
                    }, 60000);
                }

                setupBroadcast();
                stopBroadcastIfIdle();

            }
            return next();
        },
        routes: {

        },
    }
}
