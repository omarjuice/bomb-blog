import React, { Component } from 'react';
import { Subscription, Query } from 'react-apollo'
import moment from 'moment'
import client from '../../apollo/client';
import { NEW_POST, NEW_COMMENT, NEW_LIKE, NEW_COMMENT_LIKE, NEW_REPLY, NEW_FOLLOWER } from '../../apollo/subscriptions';
import { AUTHENTICATED } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import Comment from '../posts/comments/Comment';
import BombSVG from '../svg/bomb';
import { shortenNumber } from '../../utils';
class Notifications extends Component {
    state = {
        listChildren: []
    }
    componentDidMount() {
        const notifs = this
        this.commentListener = client.subscribe({ query: NEW_COMMENT }).subscribe({
            next({ data }) {
                notifs.setState({ listChildren: [notifs.genNewComment(data.newComment), ...notifs.state.listChildren] })
            }
        })
        this.postListener = client.subscribe({ query: NEW_POST }).subscribe({
            next({ data }) {
                notifs.setState({ listChildren: [notifs.genNewPost(data.newPost), ...notifs.state.listChildren] })
            }
        })
        this.likeListener = client.subscribe({ query: NEW_LIKE }).subscribe({
            next({ data }) {
                notifs.setState({ listChildren: [notifs.genNewLike(data.newLike), ...notifs.state.listChildren] })
            },

        })
        this.replyListener = client.subscribe({ query: NEW_REPLY }).subscribe({
            next({ data }) {
                notifs.setState({ listChildren: [notifs.genNewReply(data.newReply), ...notifs.state.listChildren] })
            }
        })
        this.commentLikeListener = client.subscribe({ query: NEW_COMMENT_LIKE }).subscribe({
            next({ data }) {
                notifs.setState({ listChildren: [notifs.genNewCommentLike(data.newCommentLike), ...notifs.state.listChildren] })
            }
        })
        this.followListener = client.subscribe({ query: NEW_FOLLOWER }).subscribe({
            next({ data }) {
                notifs.setState({ listChildren: [notifs.genNewFollow(data.newFollower), ...notifs.state.listChildren] })
            }
        })
        return null
    }
    genNewComment = ({ id, commenter, post, comment_text, tags, created_at }) => {
        return (
            <article key={`comment-${id}`} className="media">
                <figure className="media-left">
                    <p className="image is-64x64">
                        <img src={commenter.profile.photo_path || '/static/user_image.png'} />
                    </p>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <a><strong>{commenter.username}</strong></a> commented on your post:
                        <br />
                            <strong className="is-size-5"><em>{post.title}</em></strong>
                            <br />

                            <div className="message is-info">
                                <p className="message-body">
                                    <span className="icon has-text-info"><i className="fas fa-comment"></i></span>
                                    {comment_text}
                                    <br />
                                    {tags && tags.map((tag, i) => <div key={tag.id} className={i % 2 === 0 ? 'tag is-primary font-2' : 'tag font-2'}>{tag.tag_name}</div>)}
                                </p>
                            </div>

                            <br />

                        </div>
                    </div>
                    <nav className="level is-mobile">
                        <div className="level-left">
                            <span className="level-item has-text-grey">
                                {moment.utc(Number(created_at)).local().fromNow()}
                            </span>
                        </div>
                    </nav>
                </div>

            </article>
        )
    }
    genNewPost = ({ id, title, caption, author, tags, image, created_at }) => {
        return (
            <article key={`post-${id}`} className="media">
                <figure className="media-left">
                    <p className="image is-64x64">
                        <img src={author.profile.photo_path || '/static/user_image.png'} />
                    </p>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <a><strong>{author.username}</strong></a> posted:
                                                    <br />
                            <strong className="is-size-5"><em>{title}</em></strong>
                            <br />
                            {caption}
                            <br />
                            {image && <figure className="image is-4by3">
                                <img src={image} alt="" />
                            </figure>}
                            {tags.map((tag, i) => <div key={tag.id} className={i % 2 === 0 ? 'tag is-primary font-2' : 'tag is-info font-2'}>tag</div>)}

                        </div>
                    </div>
                    <nav className="level is-mobile">
                        <div className="level-left">
                            <span className="level-item has-text-grey">
                                {moment.utc(Number(created_at)).local().fromNow()}
                            </span>
                        </div>
                    </nav>
                </div>

            </article>
        )
    }
    genNewLike = ({ user, post, liked_at }) => {
        return (
            <article key={`like-${user.id}-${post.id}`} className="media">
                <figure className="media-left">
                    <p className="image is-64x64">
                        <img src={user.profile.photo_path || "/static/user_image.png"} />
                    </p>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <a><strong>{user.username}</strong></a> liked your post:
                        <br />
                            <strong className="is-size-5"><em>{post.title}</em></strong>
                            <br />
                            <BombSVG scale={0.1} lit={true} />

                        </div>
                    </div>
                    <nav className="level is-mobile">
                        <div className="level-left">
                            <span className="level-item has-text-grey">
                                {moment.utc(Number(liked_at)).local().fromNow()}
                            </span>
                            <p className="level-item has-text-primary"><span className="icon"><i className="fas fa-bomb"></i></span>{shortenNumber(post.numLikes)}</p>
                        </div>
                    </nav>
                </div>

            </article>
        )
    }
    genNewCommentLike = ({ user, comment, liked_at }) => {
        return (
            <article key={`comment-like-${user.id}-${comment.id}`} className="media">
                <figure className="media-left">
                    <p className="image is-64x64">
                        <img src={user.profile.photo_path || "/static/user_image.png"} />
                    </p>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <a><strong>{user.username}</strong></a> liked your comment:
                                            <br />
                            <div className="message is-dark">
                                <p className="message-body">
                                    <span className="icon"><i className="fas fa-comment"></i></span>
                                    {comment.comment_text}
                                    <br />
                                    {comment.tags.map((tag, i) => <div key={tag.id} className={i % 2 === 0 ? 'tag is-primary font-2' : 'tag is-info font-2'}>{tag.tag_name}</div>)}
                                </p>
                            </div>
                            <br />
                            On
                            <strong className="is-size-5"><em> {comment.post.title}</em></strong>
                            <br />
                            <BombSVG scale={0.1} lit={true} />

                        </div>
                    </div>
                    <nav className="level is-mobile">
                        <div className="level-left">
                            <span className="level-item has-text-grey">
                                {moment.utc(Number(liked_at)).local().fromNow()}
                            </span>
                            <p className="level-item has-text-primary"><span className="icon"><i className="fas fa-bomb"></i></span>{shortenNumber(comment.numLikes)}</p>
                        </div>
                    </nav>
                </div>

            </article>
        )
    }
    genNewReply = ({ id, reply_text, replier, comment, created_at }) => {
        return (
            <article key={`reply-${id}`} className="media">
                <figure className="media-left">
                    <p className="image is-64x64">
                        <img src={replier.profile.photo_path || "/static/user_image.png"} />
                    </p>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <a><strong>{replier.username}</strong></a> replied to your comment:
                                            <br />
                            <div className="media">
                                <div className="media-content">
                                    <div className="message content is-dark">
                                        <p className="message-body">
                                            <span className="icon"><i className="fas fa-comment"></i></span>
                                            {comment.comment_text}
                                            <br />
                                        </p>
                                    </div>
                                    <div className="media">
                                        <div className="media-content">
                                            <div className="message is-info">
                                                <p className="message-body">
                                                    <span className="icon has-text-info"><i className="fas fa-reply"></i></span>
                                                    {reply_text}
                                                    <br />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <br />
                            On <strong className="is-size-5"><em>{comment.post.title}</em></strong>
                        </div>
                    </div>
                    <nav className="level is-mobile">
                        <div className="level-left">
                            <span className="level-item has-text-grey">
                                {moment.utc(Number(created_at)).local().fromNow()}
                            </span>
                        </div>
                    </nav>
                </div>

            </article>
        )
    }
    genNewFollow = ({ user: { id, username, profile }, followed_at }) => {
        return (
            <article key={`follow-${id}`} className="media">
                <figure className="media-left">
                    <p className="image is-64x64">
                        <img src={profile.photo_path || '/static/user_image.png'} />
                    </p>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <a><strong>{username}</strong></a> followed you
                                            <br />
                            <p className="has-text-centered">
                                <span className="icon is-large has-text-success"><i className="fas fa-user fa-2x"></i></span>
                            </p>
                        </div>
                    </div>
                    <nav className="level is-mobile">
                        <div className="level-left">
                            <span className="level-item has-text-grey">
                                {moment.utc(Number(followed_at)).local().fromNow()}
                            </span>
                            {/* <p className="level-item has-text-primary"><span className="icon"><i className="fas fa-bomb"></i></span>{300000}</p> */}
                        </div>
                    </nav>
                </div>

            </article>
        )
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
        return (
            <div>
                <Query query={AUTHENTICATED}>
                    {({ loading, error, data, client }) => {
                        if (loading) return <Loading />;
                        if (error) return <ErrorIcon />;
                        return <div className="tile is-vertical">
                            {this.state.listChildren}

                        </div>

                    }}
                </Query>

            </div>
        );
    }
}

export default Notifications;
