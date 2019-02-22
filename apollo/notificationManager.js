import { NEW_COMMENT, NEW_POST, NEW_LIKE, NEW_REPLY, NEW_COMMENT_LIKE, NEW_FOLLOWER, FEATURED_POST, APP_MESSAGE } from "./subscriptions";
import { NOTIFICATIONS } from "./queries";
import { setNumNotifications } from "./clientWrites";

class NotificationManager {
    constructor(client) {
        this.client = client
        this.userId = null
        this._subscribed = false
        this._generated = false
        this.notificationMap = {}
        this.allNotifications = []
    }
    store(notifications) {
        if (this.allNotifications.length < 2) {
            let combinedNotifications = []
            let { lastVisited, ...notifs } = notifications
            for (let key in notifs) {
                if (Array.isArray(notifs[key])) {
                    combinedNotifications.push(...notifs[key])
                }
            }
            combinedNotifications = combinedNotifications.sort((a, b) => {
                let aTime = a.created_at || a.liked_at || a.followed_at || a.featured_at
                let bTime = b.created_at || b.liked_at || b.followed_at || b.featured_at
                return Number(aTime) > Number(bTime) ? -1 : 1
            })
            this.allNotifications = combinedNotifications.map(notification => this._addNotificationAndReturnKey(notification))
            this._update()
        }
        return this
    }
    _update() {
        setNumNotifications(this.allNotifications.length)
    }
    _getKey({ __typename, ...data }) {
        switch (__typename) {
            case 'Post':
                return `post-${data.id}`;
            case 'Comment':
                return `comment-${data.id}`;
            case 'Reply':
                return `reply-${data.id}`;
            case 'NewLike':
                return `like-${data.user.id}-${data.post.id}`;
            case 'NewCommentLike':
                return `commentLike-${data.user.id}-${data.comment.id}`;
            case 'NewFollower':
                return `follower-${data.user.id}`
            case 'FeaturedPost':
                return `featured-${data.post.id}`;
            case 'AppMessage':
                return `message-${data.created_at}`
        }
    }
    _addNotificationAndReturnKey(data) {
        const key = this._getKey(data)
        if (!this.notificationMap[key]) {
            this.notificationMap[key] = data
            return key
        }
        return null
    }
    _newNotification(data) {
        console.log(data);
        const key = this._addNotificationAndReturnKey(data)
        if (key) { this.allNotifications = [key, ...this.allNotifications] }
        this._update()
    }
    generate(id) {
        if (this.userId !== id) { this._reset() }
        if (!this._generated) {
            this.userId = id
            this.commentListener = {
                base: this.client.subscribe({ query: NEW_COMMENT, variables: { id } })
            }
            this.postListener = {
                base: this.client.subscribe({ query: NEW_POST, variables: { id } })
            }
            this.likeListener = {
                base: this.client.subscribe({ query: NEW_LIKE, variables: { id } })
            }
            this.replyListener = {
                base: this.client.subscribe({ query: NEW_REPLY, variables: { id } })
            }
            this.commentLikeListener = {
                base: this.client.subscribe({ query: NEW_COMMENT_LIKE, variables: { id } })
            }
            this.followListener = {
                base: this.client.subscribe({ query: NEW_FOLLOWER, variables: { id } })
            }
            this.featuredListener = {
                base: this.client.subscribe({ query: FEATURED_POST, variables: { id } })
            }
            this.appMessageListener = {
                base: this.client.subscribe({ query: APP_MESSAGE, variables: { id } })
            }
            this._generated = true
        }
        return this
    }
    _reset() {
        this.commentListener = null;
        this.postListener = null;
        this.likeListener = null;
        this.replyListener = null;
        this.commentLikeListener = null;
        this.featuredListener = null;
        this.appMessageListener = null
        this.userId = null
        this._subscribed = false
        this._generated = false
        this.notificationMap = {}
        this.allNotifications = []
    }

    subscribe() {
        if (!this._subscribed && this._generated) {
            const { client } = this
            const manager = this
            this.commentListener.subscription = this.commentListener.base.subscribe({
                next({ data: { newComment } }) {
                    if (newComment) {
                        const data = client.readQuery({ query: NOTIFICATIONS })
                        data.notifications.newComments.push(newComment)
                        client.writeQuery({ query: NOTIFICATIONS, data })
                        manager._newNotification(newComment)
                    }
                }
            })
            this.postListener.subscription = this.postListener.base.subscribe({
                next({ data: { newPost } }) {
                    if (newPost) {
                        const data = client.readQuery({ query: NOTIFICATIONS })
                        data.notifications.newPosts.push(newPost)
                        client.writeQuery({ query: NOTIFICATIONS, data })
                        manager._newNotification(newPost)
                    }
                }
            })
            this.likeListener.subscription = this.likeListener.base.subscribe({
                next({ data: { newLike } }) {
                    if (newLike) {
                        const data = client.readQuery({ query: NOTIFICATIONS })
                        data.notifications.newLikes.push(newLike)
                        client.writeQuery({ query: NOTIFICATIONS, data })
                        manager._newNotification(newLike)
                    }
                },

            })
            this.replyListener.subscription = this.replyListener.base.subscribe({
                next({ data: { newReply } }) {
                    if (newReply) {
                        const data = client.readQuery({ query: NOTIFICATIONS })
                        data.notifications.newReplies.push(newReply)
                        client.writeQuery({ query: NOTIFICATIONS, data })
                        manager._newNotification(newReply)
                    }
                }
            })
            this.commentLikeListener.subscription = this.commentLikeListener.base.subscribe({
                next({ data: { newCommentLike } }) {
                    if (newCommentLike) {
                        const data = client.readQuery({ query: NOTIFICATIONS })
                        data.notifications.newCommentLikes.push(newCommentLike)
                        client.writeQuery({ query: NOTIFICATIONS, data })
                        manager._newNotification(newCommentLike)
                    }
                }
            })
            this.followListener.subscription = this.followListener.base.subscribe({
                next({ data: { newFollower } }) {
                    if (newFollower) {
                        const data = client.readQuery({ query: NOTIFICATIONS })
                        data.notifications.newFollowers.push(newFollower)
                        client.writeQuery({ query: NOTIFICATIONS, data })
                        manager._newNotification(newFollower)
                    }
                }
            })
            this.featuredListener.subscription = this.featuredListener.base.subscribe({
                next({ data: { featuredPost } }) {
                    if (featuredPost) {
                        const data = client.readQuery({ query: NOTIFICATIONS })
                        data.notifications.featuredPosts.push(featuredPost)
                        client.writeQuery({ query: NOTIFICATIONS, data })
                        manager._newNotification(featuredPost)
                    }
                }
            })
            this.appMessageListener.subscription = this.appMessageListener.base.subscribe({
                next({ data: { appMessage } }) {
                    if (appMessage) {
                        const data = client.readQuery({ query: NOTIFICATIONS })
                        data.notifications.appMessages.push(appMessage)
                        client.writeQuery({ query: NOTIFICATIONS, data })
                        manager._newNotification(appMessage)
                    }
                }
            })
            this._subscribed = true
        }
        return this
    }
    unsubscribe() {
        if (this._subscribed) {
            this.commentListener.subscription.unsubscribe()
            this.postListener.subscription.unsubscribe()
            this.likeListener.subscription.unsubscribe()
            this.commentLikeListener.subscription.unsubscribe()
            this.replyListener.subscription.unsubscribe()
            this.followListener.subscription.unsubscribe()
            this.featuredListener.subscription.unsubscribe()
            this.appMessageListener.subscription.unsubscribe()
            this._subscribed = false
        }
        return this
    }
}
export default NotificationManager