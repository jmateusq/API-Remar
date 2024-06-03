class TimeStats{
    constructor(){
    }
    getData(params){
        const body = params 
        const data = new Map();
        let now = new Date(Date.now());      
        let originalOffset = now.getTimezoneOffset();
        now.setMinutes(now.getMinutes() + (-180-originalOffset));
        const nowBRT = `${now.getFullYear()}-${now.getMonth()}-${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`
        data.set('timestamp',body.timestamp?body.timestamp:nowBRT);

        if(body.levelId){
            data.set('levelId',parseInt(body.levelId));
            data.set('levelName', body.levelName);

        }

        if(body.challengeId){
            data.set('challengeId', parseInt(body.challengeId));
            
        }

        data.set('time',parseFloat(body.time));
        data.set('timeType',parseInt(body.timeType));

        return data;
    }
}

module.exports = TimeStats;