const {MongoClient} = require('mongodb');
var uri = "mongodb://admin:root@mongo:27017/test?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin"
let client;

const HOST = process.env.MONGODB_HOST;
const USER = process.env.MONGODB_USER;
const PASS = process.env.MONGODB_PASS;
const DATABASE = process.env.MONGODB_DATABASE;


class DB {
    constructor() {
        this.mongoConnect(HOST, USER, PASS, DATABASE);
    }

    async mongoConnect(host, user, password, database) {
        try{
            var connected = false; //não consegui verificar se está conectado

            while (!connected) {

                console.log("host = " + host + ", user = " + user + ", password = " + password);
                console.log("Connecting to database " + database + " at " + (host != null ? host : "localhost") + "...");
                console.log("=> Waiting for confirmation of MongoDB service startup");
                if (HOST == null) {           
                    client = new MongoClient("mongodb://127.0.0.1:27017")
                    await client.connect();
                    connected=true;
                } else {
                    client = new MongoClient(uri);
                    //client = new MongoClient("mongodb://" + user + ":" + password + "@" + host + "/test?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin");
                    await client.connect();
                    connected=true;
                }
            }
            console.log("MongoDB successfully started.");
        }catch(err){
            console.log(err);
        }
        
    }
    /*
    async findOne(collectionName, query, proj) {
        var result = null;
        var ok = false;
    
        while (!ok) {
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log("=> Waiting for result");
            
            await this.conn.collection(collectionName).findOne(query, {projection: proj}) 
                    .then(res => { result = res; ok = true })
                    .catch(err => console.log(err))
            
        }
    
        return result;
    }
    
    async find(collectionName, query, projection) {
        var result = [];
        var ok = false;

        while (!ok) {
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log("=> Waiting for result");
            
            await this.conn.collection(collectionName).find(query).project(projection).toArray() 
                    .then(res => { result = res; ok = true;})
                    .catch(err => console.log(err))
            
        }
    
        return result;
    }

    async getNextSequenceValue(sequenceName){
        
        var ret = await this.findOne('counters', {_id: sequenceName}, {sequence_value: 1});
        var value = 1;
        console.log(ret);

        if (ret == null) {
            this.conn.collection('counters').insertOne({_id: sequenceName, sequence_value: value});
        } else {
            value = ret.sequence_value + 1;
            const filter = {_id: sequenceName };
            const newValue = {$set: {sequence_value: value} };
            this.conn.collection("counters").updateOne(filter, newValue);
        }
        return value;
     }
    async updateOne(collection,filter,update){
        const retorno = await this.conn.collection(collection).updateOne(filter, update);
        return retorno;
    }*/
    async insert(collectionName, object) {
        const feedback = await client.db(DATABASE).collection(collectionName).insertOne(object);
        return feedback.insertedId;

    }
    /*
    list(collectionName, filter) {
        return this.conn.collection(collectionName).find(filter).toArray();
    }*/

}

module.exports = DB;