import React, { Component } from 'react';
import { Query } from 'react-apollo';
import moment from 'moment'
import Loading from '../meta/Loading';
import { USER_POSTS } from '../../apollo/queries';
import Link from 'next/link';
import LikePost from '../posts/LikePost';
import UnlikePost from '../posts/UnlikePost';


class UserPosts extends Component {
    render() {
        return (
            <>
                <h1 className="title is-2 font-1">
                    Posts
                </h1>
                <Query query={USER_POSTS} variables={{ id: this.props.userId }}>
                    {({ loading, error, data }) => {
                        if (loading) return <Loading size="5x" color="primary" />
                        if (error) return <ErrorIcon size="5x" color="primary" />;
                        if (data.user.posts.length < 1) {
                            return (
                                <div>
                                    <span className="icon has-text-primary"><i className="fas fa-5x fa-bomb"></i></span>
                                    <hr />
                                    <h1 className="subtitle font-2 is-4">{data.user.isMe ? 'You have no Posts...' : `${data.user.username} has no Posts...`}</h1>
                                </div>
                            )
                        }
                        return (
                            <div className="columns is-centered is-mobile">
                                <div className="box column is-full-mobile is-four-fifths-tablet is-8-desktop">
                                    {data.user.posts.map(({ id, title, created_at, last_updated, numLikes, numComments, caption, iLike }) => {
                                        return (
                                            <article key={id} className="media has-text-centered">
                                                <figure className="media-left">
                                                    <p className="image is-48x48">
                                                        <img src={data.user.profile.photo_path || "/static/user_image.png"} />
                                                    </p>
                                                </figure>
                                                <div className="media-content">
                                                    <div className="content">
                                                        <p>
                                                            <Link href={{ pathname: '/posts', query: { id } }}><a><strong className="font-2">{title} </strong></a></Link>
                                                            <br />
                                                            {caption}
                                                            <br />
                                                            <small>
                                                                <a><span className="icon has-text-primary has-text-weight-bold"><i className="fas fa-heart"></i>{`${numLikes}`}</span></a> · <a>
                                                                    <span className="icon has-text-weight-bold has-text-info"><i className="fas fa-comments"></i> {numComments}</span></a> · {moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}
                                                            </small>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="media-right columns is-multiline is-mobile is-centered">
                                                    <div className="column is-half has-text-centered">
                                                        {iLike ? <UnlikePost size="2x" postId={id} pageDetails={{ page: "profile", userId: this.props.userId }} /> : <LikePost size="2x" postId={id} pageDetails={{ page: "profile", userId: this.props.userId }} />}
                                                    </div>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                                <style jsx>{`
                                    .box{
                                        padding: 30px
                                    }
                                `}</style>
                            </div>
                        )
                    }}
                </Query>
            </>
        );
    }
}

export default UserPosts;
