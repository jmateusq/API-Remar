const {MongoClient} = require('mongodb');
let client;

const HOST = process.env.MONGODB_HOST;
const USER = process.env.MONGO_INITDB_ROOT_USERNAME;
const PASS = process.env.MONGO_INITDB_ROOT_PASSWORD;
const DATABASE = process.env.MONGODB_DATABASE;
const PORT = process.env.MONGODB_PORT;


class DB {
    constructor() {
        this.mongoConnect(HOST, USER, PASS, DATABASE,PORT);
    }

    async mongoConnect(host, user, password, database, port) {
        try{
            var connected = false; //não consegui verificar se está conectado

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

    async updateOne(collection,filter,update){
        update = {$set: update};
        const feedback = await this.conn.collection(collection).updateOne(filter,update);
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

}

module.exports = DB;