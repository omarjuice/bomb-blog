const { queryDB } = require('../../db/connect')
const { compare, hashUser } = require('../../db/crypt')
const Errors = require('../errors')
const validator = require('email-validator')
const authenticate = require('./authenticate')
const Query = require('./Query')
const Mutation = require('./Mutation')
const User = require('./User')
const Post = require('./Post')
const Comment = require('./Comment')
const Reply = require('./Reply')
const Profile = require('./Profile')
const Tag = require('./Tag')
const Follower = require('./Follower')
const Liker = require('./Liker')
const resolvers = {
    Query,
    Mutation,
    User,
    Post,
    Comment,
    Reply,
    Profile,
    Tag,
    Follower,
    Liker
};

module.exports = resolvers