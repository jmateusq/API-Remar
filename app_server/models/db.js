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
    
    async findOne(collectionName, query, proj) {
        const feedback = await this.conn.collection(collectionName).findOne(query, {projection: proj});
        return feedback;
    }
    
    async find(collectionName, query, proj) {
        const feedback = await this.conn.collection(collectionName).find(query, {projection: proj}).toArray();
        return feedback;
    }

    async updateOne(collectionName,filter,update){
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
        const collectionEntry = await this.findOne("rankingStats",{"exportedResourceId" : data.get('exportedResourceId')},{}); //seria melhor usar o find? problema com o toArray
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