const moment = require('moment');

let generatePhoneOTPToken = input => {
    return Math.floor(Math.random() * 9000) + 1000;
};

let generateTimeStamptoDB = input => {
    return moment.utc()
        .toISOString();
};

const util = require('util');

let compareTimestamps = (date, dateTo) => {
    try {
        let duration = moment.duration(date.diff(moment(dateTo)))
            .asSeconds();
        return duration + new Date().getTimezoneOffset() * 60;
    } catch (err) {
        throw err;
    }
}

let compareTimestampInDays = (date, dateTo) => {
    try {
        let duration = date.diff(dateTo, 'days');
        return duration;
    } catch (err) {
        throw err;
    }
}

const checkMomentObject = (object) => {
    return moment.isMoment(object);
}


let timeout = ms =>
    new Promise(res => setTimeout(res, ms));

let getRoundOffValue = (float, adj) => {
    adj = adj || 0;
    return ( Math.round( float * Math.pow(10, adj) ) / Math.pow(10, adj) );
}

module.exports = {
    generatePhoneToken: generatePhoneOTPToken,
    currentTimeStamp: generateTimeStamptoDB,
    moment: moment,
    util: util,
    compareTime: compareTimestamps,
    compareTimestampInDays: compareTimestampInDays,
    timeout : timeout,
    roundoff: getRoundOffValue,
    checkMomentObject: checkMomentObject
}