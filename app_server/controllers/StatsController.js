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
            const factory = StatisticFactory.instance();
            const challengeStats = factory.createStatistics(params.data.challengeType);
            const userId = parseFloat(params.userId);
            const exportedResourceId = parseInt(params.exportedResourceId);
            const data = challengeStats.getData(params.data);
            console.log("saving challenge stats...");
            await db.insertStats("challengeStats",userId,exportedResourceId,data);//chama o método insertStats após ajustar os parametros
            sendJsonResponse(res,200);
        }catch(err){
            sendJsonResponse(res, 500, {error: err.message});
        }
    }

    saveTimeStats = async function(req, res){
        try{
            var params = req.body;
            const timeStats = new TimeStats();
            const userId = parseFloat(params.userId);
            const exportedResourceId = parseInt(params.exportedResourceId);
            const data = timeStats.getData(params.data);
            await db.insertStats("timeStats",userId,exportedResourceId,data);//chama o método insertStats após ajustar os parametros
            sendJsonResponse(res,200);
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

    ranking = async function (req,res){
        try{
            const ranking = await db.getRanking(parseFloat(req.params.exportedResourceId));
            if(ranking){
                sendJsonResponse(res,200,ranking);
            }
            else{
                sendJsonResponse(res,404,"Ranking entry not found on API");
            }
        }catch(err){
            console.log(err.message);
            sendJsonResponse(res,500,err.message);
        }
        
    }

    conclusionTime = async function(req,res){
        try{
            const arrayUsers = JSON.parse(req.params.users);
            var conclusionTime = await db.getConclusionTime(req.params.exportedResourceId,arrayUsers)
            console.log("conclusionTime: "+conclusionTime);
            sendJsonResponse(res,200,conclusionTime);

        }catch(err){
            console.log(err.message);
            sendJsonResponse(res,500,err.message);
        }
    }
}

module.exports = StatsControl;