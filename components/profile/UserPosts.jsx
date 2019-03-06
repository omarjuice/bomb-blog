import React, { Component } from 'react';
import { Query } from 'react-apollo';
import moment from 'moment'
import Loading from '../meta/Loading';
import Link from 'next/link';
import LikePost from '../posts/LikePost';
import UnlikePost from '../posts/UnlikePost';
import { shortenNumber } from '../../utils';
import { USER_POSTS } from '../../apollo/queries';
import { renderModal } from '../../apollo/clientWrites';
import LinkWrap from '../global/LinkWrap';
import LoadingMedia from '../meta/LoadingMedia';


class UserPosts extends Component {
    render() {
        return (
            <>
                <h1 className="title is-2 is-size-4-mobile font-1">
                    Posts
                </h1>
                <Query query={USER_POSTS} variables={{ id: this.props.userId }} ssr={false}>
                    {({ loading, error, data }) => {
                        if (loading) return <LoadingMedia />
                        if (error) return <ErrorIcon size="5x" color="primary" />;
                        if (data.user.posts.length < 1) {
                            return (
                                <div>
                                    <span className="icon has-text-primary"><i className="fas fa-5x fa-bomb"></i></span>
                                    <hr />
                                    <h1 className="subtitle font-1 is-4">{data.user.isMe ? 'You have no Posts...' : `${data.user.username} has no Posts...`}</h1>
                                    {data.user.isMe ? <Link href="/posts/new"><a className="subtitle font-1 is-3 has-text-link">Write one.</a></Link> : ''}
                                </div>
                            )
                        }
                        const isMe = data.user.isMe || this.props.isMe
                        return (
                            <div className="columns is-centered is-mobile">
                                <div className="column is-full-mobile is-10-desktop">
                                    {data.user.posts.map(({ id, title, created_at, numLikes, numComments, caption, iLike, image }) => {
                                        const likes = shortenNumber(numLikes)
                                        const comments = shortenNumber(numComments)
                                        const likesMargin = String(likes.length * .25) + 'rem'
                                        const commentsMargin = String(comments.length * .4) + 'rem'
                                        const timeMargin = String(comments.length * .25) + 'rem'
                                        return (
                                            <article key={id} className="media has-text-centered">
                                                <figure className="media-left">
                                                    <p className="image is-48x48">
                                                        <img src={data.user.profile.photo_path || "/static/user_image.png"} />
                                                    </p>
                                                </figure>
                                                <div className="media-content">
                                                    <div className="content">
                                                        <div>
                                                            <LinkWrap post={{ id, title }}><a><strong className="font-1">{title} </strong></a></LinkWrap>
                                                            <br />
                                                            {caption}
                                                            <br />
                                                            {image ?
                                                                <div className="columns is-centered is-mobile">
                                                                    <div className="column is-full-mobile is-four-fifths-tablet is-two-thirds-desktop">
                                                                        <figure className="image is-256x256">
                                                                            <img src={image} alt="" />
                                                                        </figure>
                                                                    </div>
                                                                </div> : ''}
                                                            <nav className="level is-mobile">
                                                                <div className="level-left">
                                                                    <a className="level-item  has-text-primary has-text-weight-bold"
                                                                        onClick={() => renderModal({ display: 'Likers', message: 'Users who like this', active: true, info: { type: 'post', id } })}>
                                                                        <span className="icon"><i className="fas fa-bomb"></i> </span>
                                                                        {likes}
                                                                    </a>
                                                                    <LinkWrap post={{ id, title }} comments={true}>
                                                                        <a className="level-item has-text-weight-bold has-text-grey">
                                                                            <span className="icon "><i className="fas fa-comments"></i> </span>
                                                                            {comments}
                                                                        </a>
                                                                    </LinkWrap>
                                                                    <span className="level-item">{moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}</span>
                                                                </div>
                                                            </nav>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="media-right columns is-multiline is-mobile is-centered">
                                                    <div className="column is-half has-text-centered">
                                                        {iLike ? <UnlikePost size="2x" postId={id} pageDetails={{ page: "profile", userId: this.props.userId }} /> :
                                                            <LikePost size="2x" postId={id} pageDetails={{ page: "profile", userId: this.props.userId }} />}
                                                    </div>
                                                    {isMe ? <div className="column is-half has-text-centered edit">
                                                        <Link href={{ pathname: '/posts/edit', query: { id } }}>
                                                            <button className="button is-success">
                                                                <span className="icon"><i className="fas fa-pen"></i></span>
                                                            </button>
                                                        </Link>
                                                    </div> : ''}

                                                </div>
                                                <style jsx>{`
                                                    .edit{
                                                        margin-top: .7rem;
                                                    }
                                                    small a:nth-of-type(1){
                                                        margin-left: ${likesMargin}
                                                    }
                                                    small a:nth-of-type(2){
                                                        margin-left: ${commentsMargin};
                                                        margin-right: ${timeMargin}
                                                    }
                                                    .image.is-4by3{
                                                        max-height: 8rem !important;
                                                        
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

export default UserPosts;
