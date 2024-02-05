class TimeStats{
    constructor(){
    }
    getData(params){
        const body = params 
        const data = new Map();
        const now = new Date(Date.now());
        const opcoes = {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          };
        const nowBRT = now.toLocaleString('pt-BR', opcoes);
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