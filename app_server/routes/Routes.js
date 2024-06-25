
var express = require('express');
const StatsControl = require('../controllers/StatsController');
var statsControl = new StatsControl;
var router = express.Router();

//Métodos para a ultilização da API 
router.post('/stats/saveChallengeStats',statsControl.saveChallengeStats);
router.post('/stats/saveTimeStats',statsControl.saveTimeStats);
router.post('/stats/saveRankingStats',statsControl.saveRankingStats);


//Métodos para consumo da API via Remar
//gets
router.get('/stats/ranking/:exportedResourceId',statsControl.ranking);
router.get('/stats/conclusionTime/:exportedResourceId&:users',statsControl.conclusionTime);

//posts

//puts
router.put('/stats/saveRankingStats',statsControl.saveRankingStats);
router.put('/stats/saveChallengeStats',statsControl.saveChallengeStats)
router.put('/stats/saveTimeStats',statsControl.saveTimeStats);

module.exports = router;