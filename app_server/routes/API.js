
var express = require('express');
var router = express.Router();
var ctrlAPI = require("../controllers/API");
const StatsControl = require('../controllers/StatsController');
var statsControl = new StatsControl;

//GET home page. 
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});


//Métodos para a ultilização da API 

//GET
router.get('/API/CS', ctrlAPI.getChallengeStats);
//PUT
router.put('/API/CS',ctrlAPI.updateChallengeStats);


//stats
router.post('/stats/saveChallengeStats',statsControl.saveChallengeStats);
router.post('/stats/saveTimeStats',statsControl.saveTimeStats);

module.exports = router;





