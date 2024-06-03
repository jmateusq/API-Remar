class RankingStats{
    constructor(){

    }
    getData(params){
        const body = params //req.body
        const data = new Map();
        let now = new Date(Date.now());      
        let originalOffset = now.getTimezoneOffset();
        now.setMinutes(now.getMinutes() + (-180-originalOffset));
        const nowBRT = `${now.getFullYear()}-${now.getMonth()}-${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`
        data.set('timestamp',body.timestamp?body.timestamp:nowBRT);
        data.set('exportedResourceId',parseFloat(body.exportedResourceId));
        data.set('score', body.score);
        return data;
    }
}

module.exports = RankingStats;

