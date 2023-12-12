const { json } = require("express");
var MultipleChoice = require("../models/Multiplechoice");
const {MongoClient} = require('mongodb');
const uri = "mongodb://admin:root@mongo:27017/test?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin"
const client = new MongoClient(uri);


//await client.connect(); não sei se deixo aqui ou dentro do método
var sendJsonResponse = function(res, status, content){
    res.status(status);
    res.json(content);
};


//isso deveria estar declarado em models? pois lá é onde a classe está, mas aqui é onde deveria ficar a lógica
const saveChallengeStats = async function(map){
    try{
        await client.connect;
        feedback = await client.db("api").collection("ChallengeStats").insertOne(map);
        return feedback.insertedId;
    }catch(err){
        sendJsonResponse(res, 500, {error: err.message});
    }finally{
        await client.close();
    }
}


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
        feedback = await saveChallengeStats(parametros);
        sendJsonResponse(res, 200, {"insertedId" : feedback});
    }
    catch(err){
        console.log(err.message);
        sendJsonResponse(res, 500, {error: err.message});
    }
}