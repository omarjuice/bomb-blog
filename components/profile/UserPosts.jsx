import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import moment from 'moment'
const USER_POSTS = gql`
    query UserPosts($id: Int){
        user(id: $id){
            id
            username
            posts{
                id
                title
                created_at
                last_updated
                numLikes
                numComments
                caption
            }
            isMe
        }
    }
`

class UserPosts extends Component {
    render() {
        return (
            <>
                <h1 className="title is-2">
                    Posts
                </h1>
                <Query query={USER_POSTS} variables={{ id: this.props.userId }}>
                    {({ loading, error, data }) => {
                        if (loading) return <p>Loading...</p>;
                        if (error) return <p>ERROR</p>;
                        if (data.user.posts.length < 1) {
                            return (
                                <h1 className="subtitle is-4">{data.user.isMe ? 'You have no Posts...' : `${data.user.username} has no Posts...`}</h1>
                            )
                        }
                        return (<div className="container">
                            {data.user.posts.map(({ id, title, created_at, last_updated, numLikes, numComments, caption }) => {
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
                                                    <strong>{title} </strong>
                                                    <br />
                                                    {caption}
                                                    <br />
                                                    <small>
                                                        <a><span className="icon"><i className="fas fa-heart"></i>{`${numLikes}`}</span></a> · <a>
                                                            <span className="icon"><i className="fas fa-comments"></i> {numComments}</span></a> · {moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}
                                                    </small>
                                                </p>
                                            </div>
                                        </div>
                                    </article>

                                )
                            })}
                        </div>
                        )
                    }}
                </Query>
            </>
        );
    }
}

export default UserPosts;
