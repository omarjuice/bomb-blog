const { queryDB } = require('../db/connect')
const { compare, hashUser } = require('../db/crypt')
const Errors = require('./errors')

const authenticate = (session) => {
    let sessionUser;
    try {
        sessionUser = session.user.id
    } catch (e) {
        sessionUser = null
    }
    return sessionUser
}

const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        user: async (_, args, { req, Loaders }) => {
            let sessionUser = authenticate(req.session)
            let id = args.id || sessionUser
            if (!id) {
                throw Errors.user.notSpecified
            }
            const user = await Loaders.user.byId.load(id)
            if (user && user.id) {
                return user
            }
            throw Errors.user.notFound
        },
        authenticated: (_, args, { req }) => !!req.session.user,
        post: async (_, args, { Loaders }) => {
            const post = await Loaders.post.byId.load(args.id)
            if (post && post.id) {
                return post
            }
            throw Errors.posts.notFound
        },
        posts: async (_, args) => {
            const query = `
            SELECT 
                id, created_at, last_updated, title, caption, user_id
            FROM posts
            ORDER BY 
                ${args.orderBy}
                ${args.order ? 'DESC' : 'ASC'}
            LIMIT ${args.limit}
            `
            const posts = await queryDB(query)
            if (posts) {
                return posts
            }
            throw Errors.posts.notFound
        }

    },
    Mutation: {
        login: async (_, { username, password }, { req }) => {
            const [user] = await queryDB(`SELECT * FROM users WHERE username='${username}'`)
            if (user) {

                const { username, pswd, id, email, created_at } = user
                if (await compare(password, pswd)) {
                    req.session.user = { id, username, email, created_at }
                    req.session.save()
                    return true
                }
                throw Errors.login.invalid
            }
            throw Errors.user.notFound
        },
        register: async (_, { username, password, email }, { req }) => {
            const [user] = await queryDB(`SELECT * FROM users WHERE username='${username}'`)
            if (!user) {
                await queryDB(`INSERT INTO users (username, email, pswd) VALUES ?`, [[[username, email, password]]], hashUser)
                    .catch(e => {
                        throw (e)
                    })
                const [newUser] = await queryDB(`SELECT username, email, id, created_at FROM users WHERE username='${username}'`)
                req.session.user = { ...newUser }
                return true
            }
            throw Errors.register.alreadyExists
        },
        logout: (_, args, { req }) => {
            if (!req.session.user) {
                return true
            }
            req.session.user = null;
            return true
        },
        updateProfile: async (parent, args, { req }) => {
            let id = authenticate(req.session)
            if (!id) {
                throw Errors.authentication.notLoggedIn
            }
            if (!args.input) {
                return false
            }
            const { about, photo_path } = args.input
            const set_about = about ? `about='${about}',` : 'about=profiles.about,'
            const set_photo = photo_path ? `photo_path='${photo_path}',` : 'photo_path=profiles.photo_path,'
            const { affectedRows } = await queryDB(`
                UPDATE profiles
                SET 
                    ${set_about}
                    ${set_photo}
                    last_updated = NOW() 
                WHERE user_id = ${id}`)
            if (affectedRows > 0) {
                return true
            } else {
                throw Errors.database
            }
        },
        createPost: async (_, args, { req }) => {
            const { title, post_content, caption } = args.input;
            let sessionUser = authenticate(req.session)
            if (!sessionUser) {
                throw Errors.authentication.notLoggedIn;
            }
            if (!title || !post_content || !caption) {
                throw Errors.posts.missingField
            }
            const { rowsAffected } = await queryDB(`INSERT INTO posts (user_id, title, caption, post_content) VALUES ?`, [[[sessionUser, title, caption, post_content]]])
            if (rowsAffected < 1) {
                return null
            }
            const [newPost] = await queryDB(`
            SELECT
                *
            FROM posts 
            WHERE user_id = ${sessionUser}
            ORDER BY created_at DESC
            LIMIT 1
            `)
            if (newPost) {
                return newPost
            }
            throw Errors.database
        },
        deletePost: async (_, args, { req }) => {
            let sessionUser = authenticate(req.session)
            if (!sessionUser) {
                throw Errors.authentication.notLoggedIn
            }
            const { affectedRows } = await queryDB(`DELETE FROM posts WHERE id=${args.id} AND user_id=${sessionUser}`)
            if (affectedRows > 0) {
                return true
            }
            return false
        },
        updatePost: async (_, args, { req }) => {
            let sessionUser = authenticate(req.session)
            if (!sessionUser) {
                throw Errors.authentication.notLoggedIn
            }
            if (!args.id) {
                throw Errors.posts.notSpecified
            }
            if (!args.input) {
                throw Errors.posts.missingField
            }
            const { title, caption, post_content } = args.input;
            const set_title = title ? `title='${title}'` : `title=posts.title`;
            const set_caption = caption ? `caption='${caption}'` : `caption=posts.caption`;
            const set_post_content = post_content ? `post_content='${post_content}'` : `post_content=posts.post_content`

            const { affectedRows } =
                await queryDB(`
                UPDATE posts
                SET
                    ${set_title},
                    ${set_caption},
                    ${set_post_content},
                    last_updated=NOW()
                WHERE id=${args.id} AND user_id=${sessionUser}
            `)
            if (affectedRows < 1) {
                throw Errors.authorization.notAuthorized
            }
            const [post] = await queryDB(`SELECT * FROM posts WHERE id=${args.id}`)
            if (post) {
                return post
            }
            throw Errors.posts.notFound
        }

    },
    User: {
        profile: async (parent, args, { req, Loaders }) => {
            const id = args.id || parent.id || req.session.user.id
            if (!id) {
                return null
            }
            const profile = await Loaders.profile.byId.load(id)
            if (profile && profile.user_id) {
                return profile
            }
            throw Errors.profile.notFound
        },
        posts: async (parent, args, { req, Loaders }) => {
            const { id } = parent
            if (!id) {
                throw Errors.posts.notFound
            }
            const posts = Loaders.post.byUserId.load(id)
            if (!posts) {
                throw Errors.posts.notFound
            }
            return posts

        }
    },
    Post: {
        author: async ({ user_id }, _, { Loaders }) => {
            const author = await Loaders.user.byId.load(user_id)
            if (!author || !author.username) {
                throw Errors.user.notFound
            }
            return author
        }

    }

};

module.exports = resolvers