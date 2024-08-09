
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
router.get('/stats/levelTime/:exportedResourceId&:users', statsControl.levelTime);
router.get('/stats/qntInLevels/:exportedResourceId&:users', statsControl.qntInLevels);
router.get('/stats/levelAttemptRatio/:exportedResourceId&:users',statsControl.levelAttemptRatio);
router.get('/stats/challAttempt/:exportedResourceId&:users',statsControl.challAttempt);
router.get('/stats/gameInfo/:exportedResourceId',statsControl.gameInfo);
router.get('/stats/challTime/:exportedResourceId&:users',statsControl.challTime);
router.get('/stats/challMistakes/:exportedResourceId&:users',statsControl.challMistakes);
router.get('/stats/levelAttempt/:exportedResourceId&:users',statsControl.levelAttempt);
router.get('/stats/avgLevelTime/:exportedResourceId&:users',statsControl.avgLevelTime);
router.get('/stats/choiceFrequency/:exportedResourceId&:users',statsControl.choiceFrequency);
router.get('/stats/challMistakeRatio/:exportedResourceId&:users',statsControl.challMistakeRatio);
router.get('/stats/playerChoiceFrequency/:exportedResourceId&:users',statsControl.playerChoiceFrequency);
router.get('/stats/playerLevelTime/:exportedResourceId&:users',statsControl.playerLevelTime);
router.get('/stats/playerChallAttempt/:exportedResourceId&:users',statsControl.playerChallAttempt);
router.get('/stats/playerChallMistakes/:exportedResourceId&:users',statsControl.playerChallMistakes);
router.get('/stats/playerChallTime/:exportedResourceId&:users',statsControl.playerChallTime)



//posts

//puts
router.put('/stats/saveRankingStats',statsControl.saveRankingStats);
router.put('/stats/saveChallengeStats',statsControl.saveChallengeStats)
router.put('/stats/saveTimeStats',statsControl.saveTimeStats);

module.exports = router;