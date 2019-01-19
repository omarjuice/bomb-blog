module.exports = {
    authentication: {
        notLoggedIn: new Error('You must be logged in to do that')
    },
    authorization: {
        notAuthorized: new Error('You are not authorized to do that.')
    },
    user: {
        notFound: new Error('User not Found'),
        notSpecified: new Error('Id or username not specified')
    },
    login: {
        invalid: new Error('Incorrect Password')
    },
    register: {
        alreadyExists: new Error('A user with that username or email already exists')
    },
    profile: {
        notFound: new Error('Profile not found'),
        notSpecified: new Error('No id specified')
    },
    database: new Error('There was a problem with the database'),
    posts: {
        notFound: new Error('Post not found.'),
        missingField: new Error('Missing Field.'),
        notSpecified: new Error('No id specified')
    },
    comments: {
        notSpecified: new Error('No post_id specified.')
    },
    replies: {
        notFound: new Error('Reply not found'),
        notSpecified: new Error('No comment_id specified')
    }


}