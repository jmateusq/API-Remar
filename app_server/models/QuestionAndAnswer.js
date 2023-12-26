const ChallengeStats = require("./ChallengeStats");

class QuestionAndAnswer extends ChallengeStats{
    constructor(){
        super();
    }
    getData(params){
        const body = params; //req.body
        const data = super.getData(params);
        data.set('question',body.question);
        data.set('correctAnswer',body.correctAnswer);
        data.set('answer',body.answer);
        return data;
    }
}

module.exports = QuestionAndAnswer;