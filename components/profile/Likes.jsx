import React, { Component } from 'react';
import { Query } from 'react-apollo';
import moment from 'moment'
import Link from 'next/link';
import Loading from '../meta/Loading';
import { LIKES } from '../../apollo/queries';
import ErrorIcon from '../meta/ErrorIcon';
import UnlikePost from '../posts/UnlikePost';


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
                                <div className="box column is-full-mobile is-four-fifths-tablet is-8-desktop">
                                    {data.user.likedPosts.map(({ id, title, author, caption, numLikes, numComments, created_at, iLike }) => {
                                        return (
                                            <article key={id} className="media has-text-centered">
                                                <figure className="media-left">
                                                    <p className="image is-48x48">
                                                        <img src={author.profile.photo_path || "/static/user_image.png"} />
                                                    </p>
                                                </figure>
                                                <div className="media-content">
                                                    <div className="content">
                                                        <p>
                                                            <Link href={{ pathname: '/posts', query: { id } }}><a><strong className="font-2">{title} </strong></a></Link>
                                                            <br />
                                                            By <Link href={{ pathname: '/profile', query: { id: author.id } }} >
                                                                <a>

                                                                    {author.isMe ? <strong>You</strong> : <em>{author.username}</em>}
                                                                </a>
                                                            </Link>
                                                            <br />
                                                            <small>
                                                                <a><span className="icon has-text-primary has-text-weight-bold"><i className="fas fa-heart"></i>{`${numLikes}`}</span></a> · <a>
                                                                    <span className="icon has-text-weight-bold has-text-link"><i className="fas fa-comments"></i> {numComments}</span></a> · {moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}
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
                                .media-right{
                                            position: relative;
                                            top: 20px;
                                        }
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

export default Likes;
