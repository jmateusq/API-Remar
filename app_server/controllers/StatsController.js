const StatisticFactory = require("../models/StatisticFactory");
const TimeStats = require("../models/TimeStats");
const RankingStats = require("../models/RankingStats");
var DB = require("../models/db"); 
const db = DB.instance(); 

var sendJsonResponse = function(res, status, content){
    res.status(status);
    res.json(content);
};


class StatsControl{
    saveChallengeStats = async function(req,res){
        try{
            var params = req.body;
            if(/*exportedToGroup()*/true){
                const factory = StatisticFactory.instance();
                const challengeStats = factory.createStatistics(params.challengeType);
                const userId = parseFloat(params.userId);
                const exportedResourceId = parseInt(params.exportedResourceId);
                const data = challengeStats.getData(params);
                console.log("saving challenge stats...");
                await db.insertStats("challengeStats",userId,exportedResourceId,data);
                sendJsonResponse(res,200);
            }else{
                sendJsonResponse(res,500,"Stats skipped. Game was not published to a group.");
            }
        }catch(err){
            sendJsonResponse(res, 500, {error: err.message});
        }
    }

    saveTimeStats = async function(req, res){
        try{
            var params = req.body;
            if(/*exportedToGroup()*/true){
                const timeStats = new TimeStats();
                const userId = parseFloat(params.userId);
                const exportedResourceId = parseInt(params.exportedResourceId);
                const data = timeStats.getData(params);
                await db.insertStats("timeStats",userId,exportedResourceId,data);
                sendJsonResponse(res,200);
            }else{
                sendJsonResponse(res,500,"Stats skipped. Game was not published to a group.");
            }
        }catch(err){
            sendJsonResponse(res,500,{error: err.message});
        }
    }

    saveRankingStats = async function(req,res){
        try{
            const rankingStats = new RankingStats();
            const data = rankingStats.getData(req.body);
            data.set('userId',req.body.userId);
            const status = await db.insertScoreToRanking(data);
            sendJsonResponse(res,200,status);
        }catch(err){
            console.log(err.message);
            sendJsonResponse(res,500,err.message);
        }   
    }

    getRankingStats = async function (req,res){
        try{
            const ranking = await db.getRanking(parseFloat(req.params.exportedResourceId));
            if(ranking){
                sendJsonResponse(res,200,ranking);
            }
            else{
                sendJsonResponse(res,404);
            }
        }catch(err){
            console.log(err);
        }
        
    }
}

module.exports = StatsControl;