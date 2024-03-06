class RankingStats{
    constructor(){

    }
    getData(params){
        const body = params //req.body
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
        data.set('exportedResourceId',parseFloat(body.exportedResourceId));
        data.set('score', body.score);
        return data;
    }
}

module.exports = RankingStats;

//precisamos resolver a questão do userId