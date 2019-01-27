import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import moment from 'moment'
import Link from 'next/link';
const LIKES = gql`
    query($id: Int){
        user(id: $id){
            id
            username
            likedPosts{
                id
                title
                author{
                    id
                    username
                    isMe
                }
                caption
                numLikes
                numComments
                created_at
            }
            isMe
        }
    }
`

class Likes extends Component {
    render() {
        return (
            <>
                <h1 className="title is-2">Likes</h1>
                <Query query={LIKES} variables={{ id: this.props.userId }}>
                    {({ loading, error, data }) => {
                        if (loading) return <p>Loading...</p>;
                        if (error) return <p>ERROR</p>;
                        if (data.user.likedPosts.length < 1) {
                            return (
                                <h1 className="subtitle">{data.user.isMe ? 'You have no likes. Go show some love.' : `${data.user.username} doesn't like anything...`}</h1>
                            )
                        }
                        return data.user.likedPosts.map(({ id, title, author, caption, numLikes, numComments, created_at }) => {
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
                                                By {author.isMe ? 'You' : <Link href={{ pathname: '/profile', query: { id: author.id } }} >
                                                    <a>
                                                        <em>{author.username}</em>
                                                    </a>
                                                </Link>}
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
                        })
                    }}
                </Query>
            </>
        );
    }
}

export default Likes;
