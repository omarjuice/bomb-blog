const { storeCloud } = require('../utils')

module.exports = {
    uploadImage: async (_, { image, type }) => {
        const { filename, createReadStream } = await image
        const stream = createReadStream()
        const upload = await storeCloud({ stream, type }).catch(e => {
            console.log(e);
            return null
        })
        if (!upload) {
            return null
        }
        console.log(upload)
        return upload.secure_url
    },
    setLastRead: (_, { lastRead }, { req }) => {
        if (req.session.user) {
            req.session.user.lastRead = lastRead
            return lastRead
        }
        return null
    }
}