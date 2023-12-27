const ChallengeStats = require("./ChallengeStats");

class DragPictures extends ChallengeStats{
    constructor(){
        super();
    }
    getData(params){
        const body = params; //req.body
        const data = super.getData(params);
        data.set('numberMoves',parseInt(body.numberMoves));
        data.set('initialSequence',body.initialSequence);
        data.set('numberPictures',body.initialSequence.split(',').length); //testar (mas não sei como)
        data.set('correctAnswer',body.correctAnswer);
        data.set('answer',body.answer);
        return data;
    }
}

module.exports = DragPictures;