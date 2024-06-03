class ChallengeStats{
    constructor(){
        if(this.constructor == ChallengeStats){
            throw new Error("Class ChallengeStats is of abstract type and can't be instantiated");
        }
    }
    getData(params){
        const body = params 
        const data = new Map();
        let now = new Date(Date.now());      
        let originalOffset = now.getTimezoneOffset();
        now.setMinutes(now.getMinutes() + (-180-originalOffset));
        const nowBRT = `${now.getFullYear()}-${now.getMonth()}-${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`
        data.set('timestamp',body.timestamp?body.timestamp:nowBRT);
        data.set('levelId',parseInt(body.levelId));
        data.set('levelName', body.levelName);
        data.set('levelSize', parseInt(body.levelSize));
        data.set('win', (/true/i).test(body.win));
        data.set('challengeId', parseInt(body.challengeId));
        data.set('challengeType', body.challengeType);
        return data;
    }
}

module.exports = ChallengeStats;