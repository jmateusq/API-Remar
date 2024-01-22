const { json } = require("express");
var MultipleChoice = require("../models/Multiplechoice");
var DB = require("../models/db");
const ChallengeStats = require("../models/ChallengeStats");
const db = new DB(); 

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
        const multipleChoice = new MultipleChoice();
        const parametros = multipleChoice.getData(req.body);//URL encoded from data
        const feedback = await db.insert("ChallengeStats",parametros);
        sendJsonResponse(res, 200, {"inserted Id" :  feedback});
    }
    catch(err){
        console.log(err.message);
        sendJsonResponse(res, 501, {error: err.message});
    }
}

module.exports.getChallengeStats = async function (req, res){
    try{
        const feedback = await db.insertStats("ChallengeStats","1");
        if(feedback.length>0){
            sendJsonResponse(res, 200, feedback);
        }else{
            sendJsonResponse(res, 404,"ChallengeStat not founded");
        }        
    }
    catch(err){
        console.log(err.message);
        sendJsonResponse(res, 501, {error: err.message});
    }   
}

module.exports.updateChallengeStats = async function (req, res){
    try{
        const feedback = await db.updateOne("ChallengeStats",{"levelName":"um"},{"levelName":"pedro"});
        sendJsonResponse(res, 200, feedback);
    }
    catch(err){
        console.log(err.message);
        sendJsonResponse(res, 501, {error: err.message});
    }   
}
