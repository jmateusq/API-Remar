const ChallengeStats = require("./ChallengeStats");

class PuzzleWithTime extends ChallengeStats{
    constructor(){
        super();
    }
    getData(params){
        const body = params; //req.body
        const data = super.getData(params);
        data.set('points',parseInt(body.points));
        data.set('partialPoints',parseInt(body.partialPoints));
        data.set('remainingTime',parseInt(body.remainingTime));
        data.set('end',(/true/i).test(body.end)); //case insensitive
        return data;
    }
}

module.exports = PuzzleWithTime;