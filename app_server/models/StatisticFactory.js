const MultipleChoice = require("./Multiplechoice");
const QuestionAndAnswer = require("./QuestionAndAnswer");
const PuzzleWithTime = require("./PuzzleWithTime");
const ShuffleWord = require("./ShuffleWord");
const DragPictures = require("./DragPictures");



class StatisticFactory {
    static #internalConstructor = false;
    static #internalinstance = null;
    constructor(){
        if(!StatisticFactory.#internalConstructor){
            throw new TypeError("You cannot use ''New StatisticFactory()'' because it use singleton");
        }
        StatisticFactory.#internalConstructor = false;
    }

    static instance(){
        if(StatisticFactory.#internalinstance==null){
            StatisticFactory.#internalConstructor = true;
            StatisticFactory.#internalinstance = new StatisticFactory();
        }
        return StatisticFactory.#internalinstance;
    }

    createStatistics(challengeType){
        let stats;
        switch(challengeType){
            case 'questionAndAnswer':
                stats = new QuestionAndAnswer();
                break;
            case 'multipleChoice':
                stats = new MultipleChoice();
                break;
            case 'puzzleWithTime':
                stats = new PuzzleWithTime();
                break;
            case 'shuffleWord':
                stats = new ShuffleWord();
                break;
            case 'dragPictures':
                stats = new DragPictures();
                break;
        }
        return stats;
    }
}

module.exports = StatisticFactory;