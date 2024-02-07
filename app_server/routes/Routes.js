
var express = require('express');
const StatsControl = require('../controllers/StatsController');
var statsControl = new StatsControl;
var router = express.Router();

//Métodos para a ultilização da API 
router.post('/stats/saveChallengeStats',statsControl.saveChallengeStats);
router.post('/stats/saveTimeStats',statsControl.saveTimeStats);

module.exports = router;





