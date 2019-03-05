const validator = require('email-validator')
const moment = require('moment')
const { queryDB } = require('../../../db/connect')
const { compare, hashUser, hashPW } = require('../../../db/crypt')
const Errors = require('../../errors')
const { pubsub, authenticate, simplifyString, deleteCloud } = require('../utils')
module.exports = {
    login: async (_, { username, password }, { req }) => {
        const [user] = await queryDB(`SELECT * FROM users WHERE username= ? OR email=?`, [username, username]).catch(e => { throw Errors.database })
        if (user) {
            const { username, pswd, id, email, created_at } = user
            if (await compare(password, pswd)) {
                req.session.user = { id, username, email, created_at }
                req.session.user.lastLoginTime = moment(user.last_login || user.created_at).unix()
                req.session.user.lastVisited = req.session.user.lastLoginTime
                req.session.user.loginTime = Math.floor(Date.now() / 1000)
                req.session.user.visited = req.session.user.loginTime
                if (user.privilege === 'admin') {
                    req.session.user.admin = true
                }
                req.session.save()
                queryDB(`UPDATE users SET last_login=NOW() WHERE id=?`, [user.id])
                return true
            }
            throw Errors.login.invalid
        }
        throw Errors.user.notFound
    },
    register: async (_, { input }, { req }) => {
        const { username, password, email } = input;
        if (!validator.validate(email)) throw Errors.register.invalidEmail;
        const [user] = await queryDB(`SELECT * FROM users WHERE username= ? OR email=?`, [username, email])
        if (!user) {
            const { insertId } = await queryDB(`INSERT INTO users (username, email, pswd) VALUES ?`,
                [[[username, email, password]]], hashUser)
                .catch(e => { throw Errors.database })
            const [newUser] = await queryDB(`SELECT username, email, id, created_at FROM users WHERE id= ?`, [insertId]).catch(e => { throw Errors.database })
            await queryDB(`INSERT INTO profiles (user_id) VALUES ?`, [[[newUser.id]]]).catch(e => { throw Errors.database })
            req.session.user = { ...newUser }
            req.session.user.lastLoginTime = 1;
            req.session.user.lastVisited = 1;
            req.session.user.loginTime = Math.floor(Date.now() / 1000)
            req.session.user.visited = req.session.user.loginTime
            setTimeout(() => {
                pubsub.publish('APP_MESSAGE', { user_id: insertId, message: `Welcome, ${username}!`, created_at: String(Date.now()) })
            }, 1000)
            return insertId
        }
        throw Errors.register.alreadyExists
    },
    logout: (_, args, { req }) => {
        if (!req.session.user) return true;
        req.session.user = null;
        return true
    },
    createSecret: async (_, { question, answer }, { req }) => {
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn
        const insert = [sessionUser, question, await hashPW(simplifyString(answer))]
        const { affectedRows } = await queryDB(`INSERT INTO user_secrets (user_id, question, answer) VALUES ?`, [[insert]])
        return affectedRows > 0
    },
    updateProfile: async (_, args, { req, Loaders, batchDeletes, batchInserts }) => {
        let id = authenticate(req.session)
        if (!id) throw Errors.authentication.notLoggedIn;
        if (!args.input) {
            return false
        }
        const profile = await Loaders.profiles.byId.load(id)
        if (!profile.user_id) throw Errors.profile.notFound;
        const { about, photo_path } = profile
        const { affectedRows } = await queryDB(`
            UPDATE profiles
            SET 
                about= ?,
                photo_path= ?,
                last_updated = NOW() 
            WHERE user_id = ?`,
            [args.input.about !== undefined ? args.input.about : about, args.input.photo_path !== undefined ? args.input.photo_path : photo_path, id])
            .catch(e => { throw Errors.database })
        if (affectedRows > 0) {
            if (photo_path && args.input.photo_path !== undefined) {
                deleteCloud(photo_path)
            }
            if (args.input.modTags) {
                const { addTags, deleteTags } = args.input.modTags;
                if (addTags && addTags.length > 0) {
                    await batchInserts.tags.userTags(addTags, id)
                }
                if (deleteTags && deleteTags.length > 0) {
                    await batchDeletes.tags.userTags(deleteTags, id)
                }
            }
            const [profile] = await queryDB(`SELECT * FROM profiles WHERE user_id= ?`, [id])
            return profile
        } else {
            throw Errors.database;
        }
    },
    passwordReset: async (_, { id, secretAnswer, newPassword }) => {
        const [{ answer }] = await queryDB(`SELECT answer FROM user_secrets WHERE user_id=?`, [id])
        if (await compare(simplifyString(secretAnswer), answer)) {
            const pswd = await hashPW(newPassword)
            await queryDB(`UPDATE users SET pswd=? WHERE id=?`, [pswd, id])
            return true
        }
        return false
    },
}