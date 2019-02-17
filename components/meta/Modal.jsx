import React, { Component } from 'react';
import Login from '../auth/Login';
import Register from '../auth/Register';
import { Query } from 'react-apollo';
import { hideModal, clearError, renderModal, setNumNotifications } from '../../apollo/clientWrites';
import Likers from '../posts/Likers';
import { GET_MODAL, NOTIFICATIONS } from '../../apollo/queries';
import Confirm from './Confirm';
import Notifications from '../global/Notifications';
import { NEW_COMMENT, NEW_POST, NEW_LIKE, NEW_REPLY, NEW_COMMENT_LIKE, NEW_FOLLOWER } from '../../apollo/subscriptions';


const dismiss = (confirmation = false) => {
    renderModal({ confirmation })
    clearError()
}
class Modal extends Component {
    componentDidMount() {
        const { client } = this.props;
        this.commentListener = client.subscribe({ query: NEW_COMMENT }).subscribe({
            next({ data: { newComment } }) {
                const data = client.readQuery({ query: NOTIFICATIONS })
                data.notifications.newComments.push(newComment)
                client.writeQuery({ query: NOTIFICATIONS, data })
            }
        })
        this.postListener = client.subscribe({ query: NEW_POST }).subscribe({
            next({ data: { newPost } }) {
                const data = client.readQuery({ query: NOTIFICATIONS })
                data.notifications.newPosts.push(newPost)
                client.writeQuery({ query: NOTIFICATIONS, data })
            }
        })
        this.likeListener = client.subscribe({ query: NEW_LIKE }).subscribe({
            next({ data: { newLike } }) {
                const data = client.readQuery({ query: NOTIFICATIONS })
                data.notifications.newLikes.push(newLike)
                client.writeQuery({ query: NOTIFICATIONS, data })
            },

        })
        this.replyListener = client.subscribe({ query: NEW_REPLY }).subscribe({
            next({ data: { newReply } }) {
                const data = client.readQuery({ query: NOTIFICATIONS })
                data.notifications.newReplies.push(newReply)
                client.writeQuery({ query: NOTIFICATIONS, data })
            }
        })
        this.commentLikeListener = client.subscribe({ query: NEW_COMMENT_LIKE }).subscribe({
            next({ data: { newCommentLike } }) {
                const data = client.readQuery({ query: NOTIFICATIONS })
                data.notifications.newCommentLikes.push(newCommentLike)
                client.writeQuery({ query: NOTIFICATIONS, data })
            }
        })
        this.followListener = client.subscribe({ query: NEW_FOLLOWER }).subscribe({
            next({ data: { newFollower } }) {
                const data = client.readQuery({ query: NOTIFICATIONS })
                data.notifications.newFollowers.push(newFollower)
                client.writeQuery({ query: NOTIFICATIONS, data })
            }
        })
    }
    componentWillUnmount() {
        this.postListener.unsubscribe()
        this.commentListener.unsubscribe()
        this.commentLikeListener.unsubscribe()
        this.likeListener.unsubscribe()
        this.followListener.unsubscribe()
        this.replyListener.unsubscribe()
    }
    render() {
        const getDisplay = (display, info) => {
            if (info) {
                info = JSON.parse(info)
            }
            const displays = {
                Login: <Login onComplete={dismiss} />,
                Register: <Register onComplete={dismiss} />,
                Likers: <Likers info={info} />,
                Confirm: <Confirm info={info || {}} />,
            }
            return displays[display]
        }
        return (
            <Query query={GET_MODAL} ssr={false}>
                {({ data }) => {
                    if (!data) return <div></div>;
                    const { active, message, display, info } = data.modal
                    return (
                        <div className={`modal ${active && 'is-active'}`}>
                            <div className="modal-background" onClick={() => dismiss(false)}></div>
                            <div className="modal-card">
                                <header className="modal-card-head has-text-centered has-background-primary">
                                    <p className="modal-card-title has-text-white font-2">{message || display}</p>
                                    <button className="delete" aria-label="close" onClick={() => dismiss(false)}></button>
                                </header>
                                <section className="modal-card-body has-text-centered">
                                    <Query query={NOTIFICATIONS} ssr={false}  >
                                        {({ data, loading, error }) => {
                                            if (error) console.log(error);
                                            if (loading || error) return <div>loading</div>;
                                            if (!data || !data.notifications) return <Notifications data={[]} lastVisited={null} active={display === 'Notifications'} />;
                                            if (data && data.notifications) {
                                                let combinedNotifications = []
                                                let { lastVisited, ...notifs } = data.notifications
                                                for (let key in notifs) {
                                                    if (Array.isArray(notifs[key])) {
                                                        combinedNotifications.push(...notifs[key])
                                                    }
                                                }
                                                combinedNotifications = combinedNotifications.sort((a, b) => {
                                                    let aTime = a.created_at || a.liked_at || a.followed_at
                                                    let bTime = b.created_at || b.liked_at || b.followed_at
                                                    return aTime > bTime ? -1 : 1
                                                })
                                                setNumNotifications(combinedNotifications.length)
                                                return <Notifications data={combinedNotifications} lastVisited={lastVisited} active={display === 'Notifications'} />
                                            }
                                            return <div></div>
                                        }}
                                    </Query>
                                    {display === 'Notifications' ? null : getDisplay(display, info)}
                                </section>
                                <footer className="modal-card-foot has-text-centered has-background-primary">
                                </footer>
                            </div>
                        </div>
                    )
                }}
            </Query>
        );
    }
}

export default Modal;
