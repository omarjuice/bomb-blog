import React, { Component } from 'react';
import moment from 'moment'
import { shortenNumber } from '../../utils';
import BombSVG from '../svg/bomb';
import LinkWrap from './LinkWrap';
import { renderModal } from '../../apollo/clientWrites';
class Notifications extends Component {

    genNewComment = (key, { id, commenter, post, comment_text, tags, created_at }) => {
        return (
            <article key={key} className="media">
                <LinkWrap toggleModal={true} profile={commenter}>
                    <figure className="media-left">
                        <p className="image is-48x48">
                            <img src={commenter.profile.photo_path || '/static/user_image.png'} />
                        </p>
                    </figure>
                </LinkWrap>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <LinkWrap toggleModal={true} profile={commenter}>
                                <strong>{commenter.username}</strong>
                            </LinkWrap> commented on your post:
                        <br />
                            <LinkWrap toggleModal={true} post={post}>
                                <strong className="is-size-5"><em>{post.title}</em></strong>
                            </LinkWrap>
                            <br />

                            <div className="message is-dark">
                                <p className="message-body">
                                    <span className="icon has-text-grey"><i className="fas fa-comment"></i></span>
                                    {comment_text}
                                    <br />
                                    {tags && tags.map((tag, i) => <span key={tag.id} className={i % 2 === 0 ? 'tag is-primary font-1' : 'tag font-1'}>{tag.tag_name}</span>)}
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
    genNewPost = (key, { id, title, caption, author, tags, image, created_at }) => {
        return (
            <article key={key} className="media">
                <figure className="media-left">
                    <LinkWrap toggleModal={true} profile={author}>
                        <p className="image is-48x48">
                            <img src={author.profile.photo_path || '/static/user_image.png'} />
                        </p>
                    </LinkWrap>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <LinkWrap toggleModal={true} profile={author} ><strong>{author.username}</strong></LinkWrap> posted:
                            <br />
                            <LinkWrap toggleModal={true} post={{ id, title }}>
                                <strong className="is-size-5"><em>{title}</em></strong>

                                {image && <>
                                    <br /> <figure className="image is-4by3">
                                        <img src={image} alt="" />
                                    </figure> </>
                                }
                                <br />
                            </LinkWrap>
                            {caption}
                            <br />
                            {tags.map((tag, i) => <span key={tag.id} className={i % 2 === 0 ? 'tag is-primary font-1' : 'tag is-dark font-1'}>{tag.tag_name}</span>)}
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
    genNewLike = (key, { user, post, liked_at }) => {
        return (
            <article key={key} className="media">
                <LinkWrap toggleModal={true} profile={user}>
                    <figure className="media-left">
                        <p className="image is-48x48">
                            <img src={user.profile.photo_path || "/static/user_image.png"} />
                        </p>
                    </figure>
                </LinkWrap>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <LinkWrap toggleModal={true} profile={user}>
                                <strong>{user.username}</strong>
                            </LinkWrap> liked your post:
                        <br />
                            <LinkWrap toggleModal={true} post={post}>
                                <strong className="is-size-5"><em>{post.title}</em></strong>
                            </LinkWrap>
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
    genNewCommentLike = (key, { user, comment, liked_at }) => {
        return (
            <article key={key} className="media">
                <LinkWrap toggleModal={true} profile={user} >
                    <figure className="media-left">
                        <p className="image is-48x48">
                            <img src={user.profile.photo_path || "/static/user_image.png"} />
                        </p>
                    </figure>
                </LinkWrap>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <LinkWrap toggleModal={true} profile={user}>
                                <strong>{user.username}</strong>
                            </LinkWrap> liked your comment:
                                            <br />
                            <div className="message is-dark">
                                <p className="message-body">
                                    <span className="icon"><i className="fas fa-comment"></i></span>
                                    {comment.comment_text}
                                    <br />
                                    {comment.tags.map((tag, i) => <span key={tag.id} className={i % 2 === 0 ? 'tag is-primary font-1' : 'tag is-dark font-1'}>{tag.tag_name}</span>)}
                                </p>
                            </div>
                            <br />
                            <span className="icon"><i className="fas fa-long-arrow-alt-right"></i></span>
                            <LinkWrap toggleModal={true} post={comment.post}>
                                <strong className="is-size-5"><em> {comment.post.title}</em></strong>
                            </LinkWrap>
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
    genNewReply = (key, { id, reply_text, replier, comment, created_at }) => {
        return (
            <article key={key} className="media">
                <LinkWrap toggleModal={true} profile={replier}>
                    <figure className="media-left">
                        <p className="image is-48x48">
                            <img src={replier.profile.photo_path || "/static/user_image.png"} />
                        </p>
                    </figure>
                </LinkWrap>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <LinkWrap toggleModal={true} profile={replier}>
                                <strong>{replier.username}</strong>
                            </LinkWrap> replied to your comment:
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
                                            <div className="message is-dark">
                                                <p className="message-body">
                                                    <span className="icon has-text-grey"><i className="fas fa-reply"></i></span>
                                                    {reply_text}
                                                    <br />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <br />
                            <span className="icon"><i className="fas fa-long-arrow-alt-right"></i></span> <LinkWrap toggleModal={true} post={comment.post}>
                                <strong className="is-size-5"><em>{comment.post.title}</em></strong>
                            </LinkWrap>
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
    genNewFollow = (key, { user: { id, username, profile }, followed_at }) => {
        return (
            <article key={key} className="media">
                <LinkWrap toggleModal={true} profile={{ id, username }}>
                    <figure className="media-left">
                        <p className="image is-48x48">
                            <img src={profile.photo_path || '/static/user_image.png'} />
                        </p>
                    </figure>
                </LinkWrap>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <LinkWrap toggleModal={true} profile={{ id, username }}>
                                <strong>{username}</strong>
                            </LinkWrap> followed you
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
                        </div>
                    </nav>
                </div>

            </article>
        )
    }
    genFeatured = (key, { post: { id, title }, featured_at }) => {
        return (
            <article key={key} className="media">
                <figure className="media-left">
                    <div className="image is-64x64">
                        <BombSVG lit={true} face={{ happy: true }} />
                    </div>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <p className="title is-5">
                            Your post has been <LinkWrap toggleModal={true} href="/">featured!</LinkWrap>
                        </p>
                        <br />
                        <LinkWrap toggleModal={true} post={{ id, title }}>
                            <strong className="is-size-5"><em>{title}</em></strong>
                        </LinkWrap>
                    </div>
                    <nav className="level is-mobile">
                        <div className="level-left">
                            <span className="level-item has-text-grey">
                                {moment.utc(Number(featured_at)).local().fromNow()}
                            </span>
                        </div>
                    </nav>
                </div>
            </article>
        )
    }
    genMessage = (key, { message, created_at }) => {
        return (
            <article key={key} className="media">
                <figure className="media-left">
                    <div className="image is-64x64">
                        <BombSVG lit={true} face={{ happy: true }} />
                    </div>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <br />
                        <p className="title is-4 font-1">
                            {message}
                        </p>
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

    render() {
        let typeMap = {}
        typeMap.Post = this.genNewPost;
        typeMap.Comment = this.genNewComment;
        typeMap.NewLike = this.genNewLike;
        typeMap.NewCommentLike = this.genNewCommentLike;
        typeMap.Reply = this.genNewReply;
        typeMap.NewFollower = this.genNewFollow;
        typeMap.FeaturedPost = this.genFeatured;
        typeMap.AppMessage = this.genMessage
        return (
            <div className={`tile is-vertical ${this.props.active ? '' : 'is-hidden'}`}>
                {!this.props.lastVisited ? <article className="media">
                    <figure className="media-left">
                        <div className="image is-64x64">
                            <BombSVG lit={true} face={{ happy: true }} />
                        </div>
                    </figure>
                    <div className="media-content font-1 has-text-centered">
                        <div className="content has-text-centered">
                            <h3 className="subtitile is-3">
                                <a onClick={() => renderModal({ active: true, display: 'Login' })}> Log in to see your notifications</a>
                            </h3>
                            <br />
                            Or
                        <br />
                            <h5 className="subtitle is-5">
                                <a onClick={() => renderModal({ active: true, display: 'Register' })}> Sign Up</a>
                            </h5>

                        </div>
                    </div>
                </article> : ''}
                {this.props.lastVisited && (this.props.data.length < 1 ? <article className="media">
                    <figure className="media-left">
                        <div className="image is-64x64">
                            <BombSVG lit={false} face={{ happy: false }} />
                        </div>
                    </figure>
                    <div className="media-content font-1 has-text-centered">
                        <div className="content has-text-centered">
                            <h3 className="subtitile is-3">
                                You have no new notifications.
                        </h3>

                        </div>
                    </div>
                </article> :
                    this.props.data.map((key, i) => {
                        if (key) {
                            const data = this.props.notificationMap[key]
                            return typeMap[data.__typename](key, data)
                        }
                        return null
                    })
                )}
            </div>
        );
    }
}

export default Notifications;
