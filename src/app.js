const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const imdb = require("../src/imdb");
const DENZEL_IMDB_ID = "nm0000243";
const MIKKELSEN_IMDB_ID = "nm0586568";

const CONNECTION_URL = "mongodb+srv://calamine:bewasbeen@cal-cluster-zt7wh.gcp.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Web_Application";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(9292, () => {
    try{
        MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
            if(error) {
                throw error;
            }
            database = client.db(DATABASE_NAME);
            collection = database.collection("denzel movies");
            console.log("Connected to `" + DATABASE_NAME + "`!");
        });
    }catch (e) { console.log(e); }
});

app.get("/movies/populate", (req, res) => {
    try{
        if (!collection) {
            return res.status(400).send("Database offline!");
        }
        imdb(DENZEL_IMDB_ID).then((movies) => {
            collection.insertMany(movies, (error, result) => {
                if (error) {
                    return res.status(500).send(error);
                }
                console.log(result.result.n + " movies added to database");

                res.send(result.result);
            });
        });
    }catch (e) { console.log(e) }
});

app.get("/movies", (req, res) => {
    try{
        if (!collection) {
            return res.status(500).send("Database offline!");
        }
        collection.find({ metascore: { $gt: 70 } }).toArray((error, result) => {
            if (error) {
                return res.status(500).send(error);
            }
            var index = Math.floor(Math.random() * result.length);
            var movie = result[index];
            res.send(movie);
            console.log(movie.id +'\n' + movie.link + movie.metascore +'\n' + movie.poster +'\n' + movie.rating +'\n' + movie.synopsis +'\n' + movie.title +'\n' + movie.votes +'\n' + movie.year);
        });
    }catch (e) { console.log(e) }
});

app.get("/movies/:id", (req, res) => {
    try{
        if (!collection) {
            return res.status(500).send("Database offline!");
        }
        var id = req.params.id;
        collection.find({ id: id }).toArray((error, result) => {
            var movie = result[0];
            if (error) {
                return res.status(500).send(error);
            }
            if (result.length > 0) {
                res.send(movie);
                console.log(movie.id +'\n' + movie.link + movie.metascore +'\n' + movie.poster +'\n' + movie.rating +'\n' + movie.synopsis +'\n' + movie.title +'\n' + movie.votes +'\n' + movie.year);
            }
            else {
                res.status(500).send({error : "No result for this id : ${id}"});
            }
        });
    }catch (e) { console.log(e);}
});

app.get("/movies/search", (req, res) => {
    try{
        if(!collection) {
            return res.status(500).send("Database offline!");
        }
        var metascore = req.params.metascore;
        collection.find({metascore: metascore}).toArray((error, result) => {
            var movie = result[0-5];
            if(error){
                return res.status(500).send(error);
            }
            if(result.length > 0) {
                res.send(movie);
                console.log(movie.id +'\n' + movie.link + movie.metascore +'\n' + movie.poster +'\n' + movie.rating +'\n' + movie.synopsis +'\n' + movie.title +'\n' + movie.votes +'\n' + movie.year);
            }
            else {
                res.status(500).send({error : "Missed"});
            }
        });
    }catch (e) { console.log(e) }
});