const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const imdb = require('../src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';
const MIKKELSEN_IMDB_ID = 'nm0586568';

const CONNECTION_URL = "";
const DATABASE_NAME = "Web_Application";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(9292, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("denzel movies");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

app.get('/movies/populate', (req, res) => {
    if (!collection) {
        return res.status(500).send('Database offline!');
    }
    imdb(DENZEL_IMDB_ID).then((val) => {
        var movies = val;
        collection.insertMany(movies, (error, result) => {
            if (error) {
                return res.status(500).send(error);
            }
            console.log(result.result.n + " movies added to database");

            res.send(result.result);
        });
    });
});

app.get('/movies', (req, res) => {
    if (!collection) {
        return res.status(500).send('Database offline!');
    }
    collection.find({ metascore: { $gt: 70 } }).toArray((error, result) => {
        if (error) {
            return res.status(500).send(error);
        }
        var index = Math.floor(Math.random() * result.length);
        var movie = result[index].title;
        res.send(movie);
        console.log(result[index]);
    });
});

app.get('/movies/:id', (req, res) => {
    if (!collection) {
        return res.status(500).send('Database offline!');
    }
    var id = req.params.id;
    collection.find({ id: id }).toArray((error, result) => {
        if (error) {
            return res.status(500).send(error);
        }
        if (result.length > 0) {
            res.send(result[0]);
        }
        else {
            res.status(500).send({error : `No result for this id : ${id}`});
        }

    });
});