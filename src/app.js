//API
const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
var app = Express();
//SCRAPPING
const imdb = require("../src/imdb");
const DENZEL_IMDB_ID = "nm0000243";
const MIKKELSEN_IMDB_ID = "nm0586568";
//MONGODB
const CONNECTION_URL = "mongodb+srv://calamine:bewasbeen@cal-cluster-zt7wh.gcp.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Web_Application";
//GRAPHQL
const graphqlHTTP = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLID,
    GraphQLList,
    GraphQLDate
} = require('graphql');
const _ = require('lodash');
const movie = require('./schema_movie.js').movie;

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;
var port = 9292;

app.listen(port, () => {
    try{
        MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
            if(error) {
                throw error;
            }
            database = client.db(DATABASE_NAME);
            collection = database.collection("denzel movies");
            console.log("Running on port: " + port + "...");
            console.log("Connected to " + DATABASE_NAME + "!");
        });
    }catch (e) { console.log(e); }
});

app.all("/", (req, res) =>
{
    res.send("Bienvenue sur l'API Denzel \n" +
        "Pour remplir la base de données accédez à : localhost:9292/movies/populate \n"+
        "Pour afficher un film au hasard accédez à : localhost:9292/movies \n" +
        "Pour afficher un film selon un id accédez à : localhost:9292/:id \n" +
        "Pour afficher une liste de films en fonction du metascore accédez à : localhost:9292/search");
});

app.get("/movies/populate", (req, res) => {
    try{
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
            return res.status(500).send({error : "Collection missing!"});
        }
        collection.find({ "metascore": { $gt: 70 } }).toArray((error, result) => {
            if (error) {
                return res.status(500).send(error);
            }
            var index = Math.floor(Math.random() * result.length);
            var movie = result[index];
            res.send(movie);
            console.log(movie.id +'\n' + movie.link +
                movie.metascore +'\n' + movie.poster +'\n'
                + movie.rating +'\n' + movie.synopsis +'\n'
                + movie.title +'\n' + movie.votes +'\n' + movie.year);
        });
    }catch (e) { console.log(e) }
});

app.get("/movies/search", (req, res) => {
    try {
        if (!collection) {
            return res.status(500).send({error : "Collection missing!"});
        }
        var metascore = parseInt(req.query.metascore);
        if (req.query.limit == null) {
            collection.find({"metascore": {$gte: metascore}}).limit(5).sort("metascore", -1).toArray((error, result) => {
                if (error) {
                    return res.status(500).send(error);
                }
                res.send(result);
            });
        }else
        {
            collection.find({"metascore": {$gte: metascore}}).limit(parseInt(req.query.limit)).sort("metascore", -1).toArray((error, result) => {
                if (error) {
                    return res.status(500).send(error);
                }
                res.send(result);
            });
        }
    }catch (e){ console.log(e);}
});

app.get("/movies/:id", (req, res) => {
    try{
        if (!collection) {
            return res.status(500).send({error : "Collection missing!"});
        }
        var id = req.params.id;
        collection.find({ id: id }).toArray((error, result) => {
            var index = Math.floor(Math.random() * result.length);
            var movie = result[index];
            if (error) {
                return res.status(500).send(error);
            }
            if (result.length > 0) {
                res.send(movie);
                console.log(movie.id +'\n' + movie.link +
                    movie.metascore +'\n' + movie.poster +'\n' +
                    movie.rating +'\n' + movie.synopsis +'\n' +
                    movie.title +'\n' + movie.votes +'\n' + movie.year);
            }
            else {
                res.status(500).send({error : "No result for this id"});
            }
        });
    }catch (e) { console.log(e);}
});

app.post("/person", (request, response) => {
    try{
        collection.insert(request.body, (error, result) => {
            if (error) {
                return response.status(500).send(error);
            }
            response.send(result.result);
        });
    }catch (e) {console.log(e);}
});

app.post("/movies/:id", (req, res) => {
    try{
        collection.updateOne({
            "id": req.params.id
        }, {
            $set: {
                "date": req.query.date,
                "review": req.query.review
            }
        }, (error, result) => {
            if (error) {
                return res.status(500).send(error);
            }
            res.send(result.result);
        });
    }catch (e) {console.log(e);}
});

//GRAPHQL QUERIES
/*const schema = new GraphQLSchema({
    query: queryType
});

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        populate: {
            type: GraphQLString,
            resolve: async () => {
                const movies = await imdb(DENZEL_IMDB_ID);
                collection.insertMany(movies, (error, result) => {
                    if (error) {
                        return response.status(500).send(error);
                    }
                });
                return "done";
            }},
        randomMovie: {
            type: movie,
            resolve: async () => {
                const res = await collection.aggregate([{
                    $match: {
                        "metascore": {
                            $gt: 70
                        }
                    }},
                    {$sample: {size: 1}
                }]).toArray()
                return res[0]
            },},
        findMovie: {
            type: movie,
            args: {
                id: {type: GraphQLString}
            },
            resolve: async (source, args) => {
                let res = await collection.findOne({
                    id: args.id
                });
                return res;
            }},
        search: {
            type: GraphQLList(movie),
            args: {
                limit: {type: GraphQLInt},
                metascore: {type: GraphQLInt}
            },
            resolve: async (source, args) => {
                let limit;
                var metascore = args.metascore;
                if (args.limit == undefined) {limit = 5}
                else {limit = args.limit;}
                const res = await collection.aggregate([{
                    $match: {
                        "metascore": {$gte: Number(metascore)}
                    }
                }, {
                    $limit: Number(limit)
                }, {
                    $sort: {"metascore": -1}
                }]).toArray()
                return res
            }},
        review: {
            type: GraphQLString,
            args: {
                id: {type: GraphQLString},
                date: {type: GraphQLString},
                review: {type: GraphQLString}
            },
            resolve: async (source, args) => {
                collection.updateOne({
                    "id": args.id
                }, {
                    $set: {
                        "date": args.date,
                        "review": args.review
                    }
                }, (error, response) => {
                    if (error) {
                        return response.status(500).send(error);
                    }
                });
                return "done";
            }
        }
    }
});
*/