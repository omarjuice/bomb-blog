import React, { Component } from 'react';
import { Query } from 'react-apollo';
import moment from 'moment'
import Link from 'next/link';
import Loading from '../meta/Loading';
import { LIKES } from '../../apollo/queries';
import ErrorIcon from '../meta/ErrorIcon';
import UnlikePost from '../posts/UnlikePost';
import LikePost from '../posts/LikePost';
import { shortenNumber } from '../../utils';


class Likes extends Component {
    render() {
        return (
            <>
                <h1 className="title is-2 font-1">
                    Likes
                </h1>
                <Query query={LIKES} variables={{ id: this.props.userId }}>
                    {({ loading, error, data }) => {

                        if (loading) return <Loading color="primary" size="4x" style="margin-top: 10px" />
                        if (error) return <ErrorIcon color="primary" size="4x" style="margin-top: 10px" />;
                        if (data.user.likedPosts.length < 1) {
                            return (
                                <div>
                                    <span className="icon has-text-primary"><i className="far fa-5x fa-heart"></i></span>
                                    <hr />
                                    <h1 className="subtitle font-2">{data.user.isMe ? 'You have no likes. Go show some love.' : `${data.user.username} doesn't like anything...`}</h1>
                                </div>
                            )
                        }
                        return (
                            <div className="columns is-centered is-mobile">
                                <div className="column is-full-mobile is-four-fifths-tablet is-8-desktop">
                                    {data.user.likedPosts.map(({ id, title, author, caption, numLikes, numComments, created_at, iLike }) => {
                                        const likes = shortenNumber(numLikes)
                                        const comments = shortenNumber(numComments)
                                        const likesMargin = String(likes.length * .25) + 'rem'
                                        const commentsMargin = String(comments.length * .4) + 'rem'
                                        const timeMargin = String(comments.length * .25) + 'rem'
                                        return (
                                            <article key={id} className="media has-text-centered">
                                                <figure className="media-left">
                                                    <p className="image is-48x48">
                                                        <img src={author.profile.photo_path || "/static/user_image.png"} />
                                                    </p>
                                                </figure>
                                                <div className="media-content">
                                                    <div className="content">
                                                        <div>
                                                            <Link href={{ pathname: '/posts', query: { id } }}><a><strong className="font-2">{title} </strong></a></Link>
                                                            <br />
                                                            By <Link href={{ pathname: '/profile', query: { id: author.id } }} >
                                                                <a>

                                                                    {author.isMe ? <strong>You</strong> : <em>{author.username}</em>}
                                                                </a>
                                                            </Link>
                                                            <br />
                                                            <nav className="level is-mobile">
                                                                <div className="level-left">
                                                                    <a className="level-item  has-text-primary has-text-weight-bold" onClick={() => renderModal({ display: 'Likers', message: 'Users who like this', active: true, info: { type: 'post', id } })}>
                                                                        <span className="icon"><i className="fas fa-bomb"></i> </span>
                                                                        {likes}
                                                                    </a>
                                                                    <a className="level-item has-text-weight-bold has-text-info">
                                                                        <span className="icon "><i className="fas fa-comments"></i> </span>
                                                                        {comments}
                                                                    </a>
                                                                    <span className="level-item">{moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}</span>
                                                                </div>
                                                            </nav>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="media-right columns is-multiline is-mobile is-centered">
                                                    <div className="column is-half has-text-centered">
                                                        {iLike ? <UnlikePost size="2x" postId={id} pageDetails={{ page: "profile", userId: this.props.userId }} /> : <LikePost size="2x" postId={id} pageDetails={{ page: "profile", userId: this.props.userId }} />}
                                                    </div>
                                                </div>
                                                <style jsx>{`
                                                    small a:nth-of-type(1){
                                                        margin-left: ${likesMargin}
                                                    }
                                                    small a:nth-of-type(2){
                                                        margin-left: ${commentsMargin};
                                                        margin-right: ${timeMargin}
                                                    }
                                                `}</style>
                                            </article>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    }}
                </Query>
            </>
        );
    }
}

export default Likes;
