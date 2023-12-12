const {MongoClient} = require('mongodb');
const uri = "mongodb://admin:root@mongo:27017/test?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin"
const client = new MongoClient(uri);
//await client.connect(); não sei se deixo aqui ou dentro do métodos

module.exports.saveChallengeStats = async function(map){
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
