const {MongoClient} = require('mongodb');
let client;

const HOST = process.env.MONGODB_HOST;
const USER = process.env.MONGO_INITDB_ROOT_USERNAME;
const PASS = process.env.MONGO_INITDB_ROOT_PASSWORD;
const DATABASE = process.env.MONGODB_DATABASE;
const PORT = process.env.MONGODB_PORT;


class DB {
    static #internalConstructor = false;
    static #internalinstance = null;
    constructor(){
        if(!DB.#internalConstructor&&!child){
            throw new TypeError("You cannot use ''New DB()'' because it use singleton");
        }
        DB.#internalConstructor = false;
    }

    static instance(){
        if(DB.#internalinstance==null){
            DB.#internalConstructor = true;
            DB.#internalinstance = new DB();
            DB.#internalinstance.mongoConnect(HOST, USER, PASS, DATABASE,PORT);
        }
        return DB.#internalinstance;
    }

    async mongoConnect(host, user, password, database, port) {
        try{
            var connected = false;

            while (!connected) {

                console.log("host = " + host + ", user = " + user + ", password = " + password);
                console.log("Connecting to database " + database + " at " + (host != null ? host : "localhost") + "...");
                console.log("=> Waiting for confirmation of MongoDB service startup");
                if (HOST == null) {           
                    client = new MongoClient("mongodb://127.0.0.1:27017")
                    await client.connect();
                    this.conn = client.db(database);
                    connected=true;
                } else {                                                                          
                    client = new MongoClient("mongodb://" + user + ":" + password + "@" + host + ":" + port + "/test?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin");
                    await client.connect();
                    this.conn = client.db(database);
                    connected=true;
                }
            }
            console.log("MongoDB successfully started.");
        }catch(err){
            console.log(err);
        }
        
    }
    
    async findOne(collectionName, query, proj) {//collectionName = nome da coleção; query = filtro de busca, proj = filtro de apresentação
        const feedback = await this.conn.collection(collectionName).findOne(query, {projection: proj});
        return feedback;
    }
    
    async find(collectionName, query, proj) {//collectionName = nome da coleção; query = filtro de busca, proj = filtro de apresentação
        const feedback = await this.conn.collection(collectionName).find(query, {projection: proj}).toArray();
        return feedback;
    }

    async updateOne(collectionName,filter,update){//collectionName = nome da coleção; query = filtro de busca, proj = filtro de apresentação
        const feedback = await this.conn.collection(collectionName).updateOne(filter,update);
        return feedback;
    }

    async insert(collectionName, object) {
        const feedback = await this.conn.collection(collectionName).insertOne(object);
        return feedback.insertedId;

    }

    async list(collectionName, filter) {
        const feedback = await this.conn.collection(collectionName).find(filter).toArray();
        return feedback;
    }

    async getStats(collectionName,exportedResourceId,userGroups=null){
        if(userGroups==null){
            const feedback = await this.find(collectionName,{"exportedResourceId":parseFloat(exportedResourceId)});
            return feedback;
        }else{
            const feedback = await this.find(collectionName,{"userId":{$in:userGroups},"exportedResourceId":parseFloat(exportedResourceId)});
            return feedback;
        }
        
    }


    async insertStats(collectionName,userId,exportedResourceId,data){
        console.log("inserting "+collectionName+":");
        console.log(data);
        const stat = await this.find(collectionName,{"userId":userId,"exportedResourceId":exportedResourceId},{});
        if(stat.length>0){ // existe uma entrada nessa coleção com esse userId e exportedResourceId
            await this.updateOne(
                collectionName, //collection
                {"userId":userId,"exportedResourceId":exportedResourceId},//filter
                { //update
                   $push:{"stats":data}
                } 
            )       
        }else{
            await this.insert(
                collectionName,//collection
                {//object
                    "userId":userId,"exportedResourceId":exportedResourceId, "stats":[data]
                }
            )
        }
    }

    async insertScoreToRanking(data){
        /*{id, exportedResourceId, ranking:[{userId, score, timestamp}]}*/
        const collectionEntry = await this.findOne("rankingStats",{"exportedResourceId" : data.get('exportedResourceId')},{});
        if(collectionEntry != null){ //verifica se já existe uma entrada com esse exportedResourceId
            const pos = collectionEntry.ranking.findIndex(obj => obj.userId == data.get('userId')); // verifica se existe uma entrada desse usuario
            if(pos!=-1){  //se entrar no if é porque existe o usuario cadastrado
                if(collectionEntry.ranking[pos].score < data.get('score')){ // novo score é maior
                    console.log("Updating user "+data.get('userId')+" score");
                    const selector = "ranking."+[pos];
                    const updateObject = {};
                    updateObject[selector] = {
                        "userId": parseFloat(data.get('userId')),
                        "score": parseFloat(data.get('score')),
                        "timestamp": data.get('timestamp')
                    };
                    await this.updateOne(
                        "rankingStats",//collection
                        {"exportedResourceId":data.get('exportedResourceId')}, //filter
                        { //update
                            $set: updateObject 
                        }
                    )
                }else{
                    console.log("no score to update for user "+data.get('userId'));
                }
            }else{
                console.log("creating user " + data.get('userId')+" score");
                this.updateOne(
                    "rankingStats",//collection
                    {"exportedResourceId":data.get('exportedResourceId')},//filter
                    {
                        $push: {"ranking" : {
                            "userId":parseFloat(data.get('userId')),
                            "score":parseFloat(data.get('score')),
                            "timestamp":data.get('timestamp')
                        }}
                    }
                )
            }
        }else{ //não tem nenhum ranking do exportedResourceId (jogo) 
            console.log("creating resource "+data.get('exportedResourceId')+" ranking entry");
            this.insert("rankingStats",{
                "exportedResourceId":data.get('exportedResourceId'),
                "ranking":[{
                    "userId":parseFloat(data.get('userId')),
                    "score":parseFloat(data.get('score')),
                    "timestamp":data.get('timestamp')
                }]
            });
        }
        
        const newcollectionEntry = await this.findOne("rankingStats",{"exportedResourceId" : data.get('exportedResourceId')},{});
        return newcollectionEntry;
    }

    async getRanking(exportedResourceId){
        try{
            let ranking = []
            const collectionEntry = await this.findOne("rankingStats",{'exportedResourceId':exportedResourceId},{})
            if(collectionEntry!=null){
                ranking = collectionEntry.ranking.sort((a,b)=>{
                    if(b.score!==a.score){
                        return b.score-a.score;
                    }else{
                        return a.timesTamp-b.timesTamp;
                    }
                });
            }
            if(ranking.length === 0){
                console.log("ERROR: Could not return ranking for resource " + exportedResourceId);
            }else{
                return ranking;
            }

        }catch(err){
            console.log(err)
        }
    }

    async getConclusionTime(exportedResourceId,users){
        try{
            const timeCollection = await this.getStats("timeStats",exportedResourceId,users);

            if(timeCollection.length>0){
                var usersTime={}; // { userId: conclusionTime }
                timeCollection.forEach(doc => {
                    const user = doc.userId;
                    doc.stats.forEach(stat => {
                        const timeType = stat.timeType;
                        const time = stat.time;
                        if (timeType === 0 && time > 0.0) {
                            if (usersTime.hasOwnProperty(user)) {
                                if (usersTime[user] > time) {
                                    usersTime[user] = time;
                                }
                            } else {
                                usersTime[user] = time;
                            }
                        }
                    });
                });
            }
            return Object.entries(usersTime).sort((a, b) => a[1] - b[1]);

        }catch(err){
            console.log(err)
        }
    }

    async getLevelTime(exportedResourceId,users){
        try{
            const timeCollection = await this.getStats("timeStats",exportedResourceId,users);
            if(timeCollection.length>0){
                var timePerLevel={};
                var timeType, time,levelName;
                timeCollection.forEach(doc=> {
                    doc.stats.forEach(stat =>{
                        timeType = stat.timeType;
                        time = stat.time;
                        if(timeType===1 && time > 0.0){
                            levelName=stat.levelName;
                            if(timePerLevel.hasOwnProperty(levelName)){
                                timePerLevel[levelName].push(time);
                            }else{
                                timePerLevel[levelName] = [time];
                            }
                        }
                    });
                });

                // Debug: descomente a linha abaixo
                //console.log('timePerLevel:', timePerLevel);

                Object.values(timePerLevel).forEach(times => times.sort((a, b) => a - b));
            
                return timePerLevel;
            }else{
                console.error(`ERROR: Could not return conclusion time for resource ${exportedResourceId}`);
                return nullconsole.log('timePerLevel:', timePerLevel);
            }
        }catch(err){
            console.log(err);
        }
    }

    async getQntInLevels(exportedResourceId,users){
        try{
            const timeCollection = await this.getStats("timeStats",exportedResourceId,users);
            if(timeCollection.length>0){
                var usersInLevel = {}; // [ gameLevel: [lista dos userIds] ]
                var user, timeType, time, levelName;
                timeCollection.forEach(doc=> {
                    user = doc.userId;
                    doc.stats.forEach(stat=>{
                        timeType = stat.timeType;
                        time = stat.time;
                        if(timeType===1 && time>0.0){
                            levelName = stat.levelName;
                            if(usersInLevel.hasOwnProperty(levelName)){// Se level ja esta no mapa
                                if(!usersInLevel[levelName].includes(user)){// e o usuario nao esta na lista de usuarios que jogaram, adiciona
                                    usersInLevel[levelName].push(user);
                                }
                            }else{ // se nao esta no mapa, coloca
                                usersInLevel[levelName] = [user];
                            }
                        }
                    }); 
                });
                //DEBUG: descomente as linhas abaixo
                //console.log("usersInLevel: ")
                //console.log(usersInLevel);
                return usersInLevel;

            }else{
                console.log("ERROR: Could not return quantity of players per level for resource " + exportedResourceId)
                return null
            }
        }catch(err){
            console.log(err.message);
        }
    }

    async getLevelAttemptRatio(exportedResourceId,users){
        try{
            const timeCollection = await this.getStats("timeStats",exportedResourceId,users);
            if(timeCollection.length>0){
                var levelAttempts = new Map();
                var user, timeType, time, levelName;

                timeCollection.forEach(doc=>{
                    user = doc.userId;
                    doc.stats.forEach(stat=>{
                        timeType = stat.timeType;
                        time = stat.time;
                        levelName = stat.levelName;

                        if(timeType===1){
                            var tuple = `${user},${levelName}`;
                            if(levelAttempts.has(tuple)){
                                var attempts = levelAttempts.get(tuple);
                                if(time>0.0){
                                    attempts[1]+=1;
                                }else{
                                    attempts[0]+=1;
                                }
                                levelAttempts.set(tuple,attempts);
                            }else{
                                levelAttempts.set(tuple,[1,0]);
                            }
                        }
                    });
                });
               
                const sortedLevelAttempts = Array.from(levelAttempts).sort((a, b) => a[1][0] - b[1][0]);
                
                //DEBUG: descomente a linha abaixo
                //console.log("sortedLevelAttempts: ")
                //console.log(sortedLevelAttempts);
                
                return sortedLevelAttempts;
            }else{
                console.log("ERROR: Could not return level attempts for resource: "+exportedResourceId);
                return null
            }

        }catch(err){
            console.log(err.message);
        }
    }

    async getChallAttempt(exportedResourceId,users){
        try{
            const statsCollection = await this.getStats("challengeStats",exportedResourceId,users);
            if(statsCollection.length>0){
                var challlAttempts = new Map();

                statsCollection.forEach(doc=>{
                    doc.stats.forEach(stat=>{
                        var tuple = `${stat.levelName}, Desafio ${stat.challengeId}`;                        
                        if(challlAttempts.has(tuple)){
                            var attempts = challlAttempts.get(tuple);
                            challlAttempts.set(tuple,attempts+1);
                        }else{
                            challlAttempts.set(tuple,1);
                        }
                    });
                });
               
                //DEBUG: descomente as linhas abaixo
                //console.log("challlAttempts: ")
                //console.log(challlAttempts);
                
                return Array.from(challlAttempts);
            }else{
                console.log("ERROR: Could not return challAttempt for resource: "+exportedResourceId);
                return null
            }

        }catch(err){
            console.log(err.message);
        }
    }

    async getGameInfo(exportedResourceId){
        try{
            const challCollection = await this.getStats("challengeStats",exportedResourceId);
            if(challCollection.length>0){
                var gameInfo = new Map();
                var infoJSON = new Map();
                var level, levelName, challenge, challengeType, question, answer;
                var info = [];


                challCollection.forEach(doc=>{
                    doc.stats.forEach(stat=>{
                        level     = stat.levelId
                        levelName = stat.levelName
                        challenge = stat.challengeId
                        challengeType = stat.challengeType

                        if(challengeType == "multipleChoice" || challengeType == "questionAndAnswer"){
                            question = stat.question;
                        }else if(challengeType == "shuffleWord"){
                            question = stat.word;
                        }else if(challengeType == "dragPictures"){
                            question = stat.initialSequence;
                        }
                        answer = stat.correctAnswer;
                        var tuple = `${level},${challenge}`;
                        info = [levelName, question, answer];

                        if(gameInfo.has(tuple)){
                            gameInfo.set(tuple,info);
                        }
                    });
                });

                gameInfo = new Map([...gameInfo.entries()].sort((a, b) => {
                    let aChallenge = parseInt(a[0].split(',')[1], 10);
                    let bChallenge = parseInt(b[0].split(',')[1], 10);
                    return aChallenge - bChallenge;
                }));


                gameInfo.forEach((value, key) => {
                    let challenge = key.split(',')[1];
                    let levelName = value[0];
                    let question = value[1];
                    let answer = value[2];

                    if (!infoJSON.hasOwnProperty(levelName)) {
                        infoJSON[levelName] = [];
                    }

                    infoJSON[levelName].push([`Desafio ${challenge}`, question, answer]);
                })
               
                // DEBUG: descomente as linhas abaixo
                // console.log("gameInfo: ", gameInfo);
                // console.log("infoJSON: ", infoJSON);

                return infoJSON;
            }else{
                console.log("ERROR: Could not return game info for resource: "+exportedResourceId);
                return null
            }

        }catch(err){
            console.log(err.message);
        }
    }


    async getChallTime(exportedResourceId,users){
        try{
            const timeCollection = await this.getStats("timeStats",exportedResourceId,users);
            if(timeCollection.length>0){
                var timePerChall = new Map();
                var timeType, time;

                timeCollection.forEach(doc=>{
                    doc.stats.forEach(stat=>{
                        timeType = stat.timeType;
                        time = stat.time;

                        if(timeType==2 && time>0.0){
                            var tuple = `${stat.levelName}, Desafio ${stat.challengeId}`;
                            if(!timePerChall.has(tuple)){
                                timePerChall.set(tuple,[]);
                            }
                            timePerChall.get(tuple).push(time);
                        }
                    });
                });
               
                //DEBUG: descomente as linhas abaixo
                //console.log("timePerChall: ")
                //console.log(timePerChall);

                timePerChall.forEach((times, key) => {
                    times.sort((a, b) => a - b);
                });
                
                return Array.from(timePerChall);
            }else{
                console.log("ERROR: Could not return conclusion time for resource (getChallTime) " + exportedResourceId);
                return null
            }

        }catch(err){
            console.log(err.message);
            return null;
        }
    }

}



















/*
POSSO FAZER A CLASSE NÃO SER FILHA E CHAMAR UMA 
INSTANCIA DE DB? OU MELHOR DEIXAR JUNTO?
OU TEM OUTRA FORMA SEM SER PASSANDO UM PARAMETRO PELO CONSTRUTOR?

class DB_stats extends DB{ //separar em outro arquivo e usar singleton em DB
    constructor(){
        super(true);
    }
    async insertStats(collectionName,userId,exportedResourceId,data){
        console.log("inserting "+collectionName+":");
        console.log(data);
        const stat = await this.find(collectionName,{"userId":userId,"exportedResourceId":exportedResourceId},{});
        if(stat.length>0){
            await this.updateOne(
                collectionName, //collection
                {"userId":userId,"exportedResourceId":exportedResourceId},//filter
                { //update
                   $push:{"stats":data}
                } 
            )       
        }else{
            await this.insert(
                collectionName,//collection
                {//object
                    "userId":userId,"exportedResourceId":exportedResourceId, "stats":[data]
                }
            )
        }
    }
}
*/
module.exports = DB;