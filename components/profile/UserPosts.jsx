import React, { Component } from 'react';
import { Query } from 'react-apollo';
import moment from 'moment'
import Loading from '../meta/Loading';
import ErrorMessage from '../meta/ErrorMessage';
import { USER_POSTS } from '../../apollo/queries';


class UserPosts extends Component {
    render() {
        return (
            <>
                <h1 className="title is-2 font-1">
                    Posts
                </h1>
                <Query query={USER_POSTS} variables={{ id: this.props.userId }}>
                    {({ loading, error, data }) => {
                        if (loading) return <Loading />
                        if (error) return <ErrorMessage />;
                        if (data.user.posts.length < 1) {
                            return (
                                <h1 className="subtitle is-4">{data.user.isMe ? 'You have no Posts...' : `${data.user.username} has no Posts...`}</h1>
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
                                                        <img src="/static/user_image.png" />
                                                    </p>
                                                </figure>
                                                <div className="media-content">
                                                    <div className="content">
                                                        <p>
                                                            <strong className="font-2">{title} </strong>
                                                            <br />
                                                            {caption}
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

export default UserPosts;
