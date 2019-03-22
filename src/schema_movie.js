const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLDouble
} = require('graphql');

// Define type for the different movie element
movie = new GraphQLObjectType({
    name: 'movie',
    fields: {
        _id: {
            type: GraphQLID
        },
        link: {
            type: GraphQLString
        },
        id: {
            type: GraphQLString
        },
        metascore: {
            type: GraphQLInt
        },
        poster: {
            type: GraphQLString
        },
        rating: {
            type: GraphQLDouble
        },
        synopsis: {
            type: GraphQLString
        },
        title: {
            type: GraphQLString
        },
        votes: {
            type: GraphQLDouble
        },
        year: {
            type: GraphQLInt
        },
        date: {
            type: GraphQLString
        },
        review: {
            type: GraphQLString
        }

    }
});

exports.movie = movie;