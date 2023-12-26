const ChallengeStats = require("./ChallengeStats");

class ShuffleWord extends ChallengeStats{
    constructor(){
        super();
    }
    getData(params){
        const body = params; //req.body
        const data = super.getData(params);
        data.set('word',body.word);
        data.set('correctAnswer',body.correctAnswer);
        data.set('answer',body.answer);
        data.set('numberTries', parseInt(body.numberTries));
        return data;
    }
}

module.exports = ShuffleWord;