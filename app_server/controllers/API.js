const { json } = require("express");
var MultipleChoice = require("../models/Multiplechoice");
var DB = require("../models/db");


var sendJsonResponse = function(res, status, content){
    res.status(status);
    res.json(content);
};


module.exports.printFromJSON = async function(req, res){
    try{
        const data = req.body;
        console.log(data);
        sendJsonResponse(res, 200, data);
    }
    catch(err){
        console.log(err.message);
        sendJsonResponse(res, 500, {error: err.message});
    }
}


module.exports.insertChallengeStats = async function (req, res){
    try{
        const db = new DB();
        console.log("cheguei aqui");//não funciona??????????
        const multipleChoice = new MultipleChoice();
        const parametros = multipleChoice.getData(req.body);//URL encoded from data
        feedback = db.insert("ChallengeStats",parametros);
        sendJsonResponse(res, 202, {"insertedId" : feedback});
    }
    catch(err){
        console.log(err.message);
        sendJsonResponse(res, 500, {error: err.message});
    }
}