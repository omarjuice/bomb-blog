const { AuthenticationError, ForbiddenError, UserInputError, ValidationError, ApolloError } = require('apollo-server-express')
module.exports = {
    authentication: {
        notLoggedIn: new AuthenticationError('You must be logged in to do that')
    },
    authorization: {
        notAuthorized: new ForbiddenError('You are not authorized to do that.')
    },
    user: {
        notFound: new ApolloError('User not Found'),
        notSpecified: new ApolloError('Id or username not specified')
    },
    login: {
        invalid: new ValidationError('Incorrect Password')
    },
    register: {
        alreadyExists: new ApolloError('A user with that username or email already exists'),
        invalidEmail: new ValidationError('Not a valid email.')
    },
    profile: {
        notFound: new ApolloError('Profile not found'),
        notSpecified: new ApolloError('No id specified')
    },
    database: new ApolloError('There was a problem with the database'),
    posts: {
        notFound: new ApolloError('Post not found.'),
        missingField: new UserInputError('Missing Field.'),
        notSpecified: new ApolloError('No id specified')
    },
    comments: {
        notSpecified: new ApolloError('No post_id specified.')
    },
    replies: {
        notFound: new ApolloError('Reply not found'),
        notSpecified: new ApolloError('No comment_id specified')
    },
    tags: {
        notFound: new ApolloError('Tag not found'),
        notSpecified: new ApolloError('Tag not Specified')
    }


}