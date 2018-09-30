// Import type helpers from graphql-js
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} = require('graphql');


// The root query type is where in the data graph
// we can start asking questions
const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',

    fields: () => ({
        hello: {
            type: GraphQLString,
            resolve(obj, args, {}) {
                return "Hello World"
            }
        }
    })
});

// const AddContestMutation = require('./mutations/add-contest');
// const AddNameMutation = require('./mutations/add-name');

// const RootMutationType = new GraphQLObjectType({
//     name: 'RootMutation',

//     fields: () => ({
//         AddContest: AddContestMutation,
//         AddName: AddNameMutation
//     })
// });

const ncSchema = new GraphQLSchema({
    query: RootQueryType,
    //mutation: RootMutationType
});

module.exports = ncSchema;