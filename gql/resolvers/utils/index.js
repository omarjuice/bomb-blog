const cloudinary = require('cloudinary').v2
const { PubSub } = require('apollo-server-express')
const fs = require('fs')
const dotenv = require('dotenv')
const shortid = require('shortid')
dotenv.load()
const pubsub = new PubSub()
const authenticate = (session) => {
    let sessionUser;
    try {
        sessionUser = session.user.id
    } catch (e) {
        sessionUser = null
    }
    return sessionUser
}
const authenticateAdmin = (session) => {
    let admin;
    try {
        if (session.user.admin) {
            admin = session.user.id
        }
    } catch (e) {
        admin = null
    }
    return admin
}
// const storeFS = ({ stream, filename }) => {
//     const id = shortid.generate()
//     const path = `./static/uploads/${id}-${filename}`
//     return new Promise((resolve, reject) => {
//         stream
//             .on('error', error => {
//                 if (stream.truncated) {
//                     fs.unlinkSync(path)
//                     reject(error)
//                 }
//             })
//             .pipe(fs.createWriteStream(path))
//             .on('error', error => reject({ error }))
//             .on('finish', () => resolve({ path, id }))
//     })
// }
// const deleteFS = path => {
//     return new Promise((resolve) => {
//         fs.exists(path, exists => exists ? fs.unlink(path, resolve) : null)
//     })
// }
const simplifyString = str => str.replace(/\s|\W/g, '').toLowerCase()
const storeCloud = ({ stream, type }) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ tags: type, folder: 'bomb-blog' }, (err, image) => {
            if (err) reject(err)
            resolve(image)
        });
        stream.pipe(uploadStream)
    })
}
const deleteCloud = path => {
    if (!/cloudinary/.test(path)) {
        return null
    }
    return new Promise((resolve, reject) => {
        const public_id = 'bomb-blog/' + path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'))
        cloudinary.uploader.destroy(public_id, { invalidate: true }, (result, error) => {
            if (error) { reject(error) }
            resolve(result)
        })
    })
}
module.exports = { authenticate, pubsub, authenticateAdmin, simplifyString, storeCloud, deleteCloud }