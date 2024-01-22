const { json } = require("express");
const StatisticFactory = require("../models/StatisticFactory");
var DB_stats = require("../models/db"); //não to entendendo a diferenciação entre DB e DB_stats
const db = new DB_stats; 

var sendJsonResponse = function(res, status, content){
    res.status(status);
    res.json(content);
};


class StatsControl{
    saveChallengeStats = async function(req,res){
        try{
            var params = req.body;
            console.log("cheguei aqui");
            if(/*exportedToGroup()*/true){
                const factory = StatisticFactory.instance();
                const challengeStats = factory.createStatistics(params.challengeType);
                console.log(challengeStats);
                const userId = parseFloat(params.userId);
                const exportedResourceId = parseInt(params.exportedResourceId);
                const data = challengeStats.getData(params);
                await db.insertStats("challengeStats",userId,exportedResourceId,data);
                console.log("saving challenge stats..."+userId+exportedResourceId+data);
                sendJsonResponse(res,200);
            }else{
                sendJsonResponse(res,500,"Stats skipped. Game was not published to a group.");
            }
        }catch(err){
            sendJsonResponse(res, 500, {error: err.message});
        }
    }
}

module.exports = StatsControl;