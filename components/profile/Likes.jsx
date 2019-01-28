import React, { Component } from 'react';
import { Query } from 'react-apollo';
import moment from 'moment'
import Link from 'next/link';
import Loading from '../meta/Loading';
import ErrorMessage from '../meta/ErrorMessage';
import { LIKES } from '../../apollo/queries';


class Likes extends Component {
    render() {
        return (
            <>
                <h1 className="title is-2 font-1">
                    Likes
                </h1>
                <Query query={LIKES} variables={{ id: this.props.userId }}>
                    {({ loading, error, data }) => {
                        if (loading) return <Loading />
                        if (error) return <ErrorMessage />;
                        if (data.user.likedPosts.length < 1) {
                            return (
                                <h1 className="subtitle">{data.user.isMe ? 'You have no likes. Go show some love.' : `${data.user.username} doesn't like anything...`}</h1>
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
                                                        <img src="/static/user_image.png" />
                                                    </p>
                                                </figure>
                                                <div className="media-content">
                                                    <div className="content">
                                                        <p>
                                                            <strong className="font-2">{title} </strong>
                                                            <br />
                                                            By {author.isMe ? 'You' : <Link href={{ pathname: '/profile', query: { id: author.id } }} >
                                                                <a>
                                                                    <em>{author.username}</em>
                                                                </a>
                                                            </Link>}
                                                            <br />
                                                            <small>
                                                                <a><span className="icon has-text-primary has-text-weight-bold"><i className="fas fa-heart"></i>{`${numLikes}`}</span></a> · <a>
                                                                    <span className="icon has-text-weight-bold"><i className="fas fa-comments"></i> {numComments}</span></a> · {moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}
                                                            </small>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="media-right columns is-multiline is-mobile is-centered">
                                                    <div className="column is-half has-text-centered">
                                                        {iLike ? <span className="icon has-text-primary"><i className="fas fa-heart fa-2x"></i></span> : <span className="icon has-text-primary"><i className="far fa-heart fa-2x"></i></span>}
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
