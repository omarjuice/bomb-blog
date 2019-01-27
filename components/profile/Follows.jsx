import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import moment from 'moment'
import Link from 'next/link'
const FOLLOWERS = gql`
    query Followers($id: Int){
        user(id: $id){
            id
            username
            followers{
                id
                username
                followed_at
            }
            isMe
        }
    }
`
const FOLLOWING = gql`
    query Followers($id: Int){
        user(id: $id){
            id
            username
            following{
                id
                username
                followed_at
            }
            isMe
        }
    }
`
const queries = {
    FOLLOWING, FOLLOWERS
}

class Follows extends Component {
    render() {
        const { display } = this.props
        return (
            <>
                <h1 className="title is-2">
                    {display}
                </h1>
                <Query query={queries[display.toUpperCase()]} variables={{ id: this.props.userId }}>
                    {({ loading, error, data }) => {
                        if (loading) return <p>Loading...</p>;
                        if (error) return <p>ERROR</p>;
                        if (data.user[display].length < 1) {
                            return (
                                <h1 className="subtitle is-4">{data.user.isMe ? `You have no ${display}.` : `${data.user.username} has no ${display}.`}</h1>
                            )
                        }
                        return data.user[display].map(({ id, username, followed_at }) => {
                            return <article key={id} className="media has-text-centered">
                                <figure className="media-left">
                                    <p className="image is-48x48">
                                        <img src="/static/user_image.png" />
                                    </p>
                                </figure>
                                <div className="media-content">
                                    <div className="content">
                                        <p>
                                            <Link href={{ pathname: '/profile', query: { id: id } }} >
                                                <a>
                                                    <strong>{username} </strong>
                                                </a>
                                            </Link>

                                            <br />
                                            <small>
                                                Followed {moment.utc(Number(followed_at)).local().format('M/DD/YY')}
                                            </small>
                                        </p>
                                    </div>
                                </div>
                            </article>
                        })
                    }}
                </Query>
            </>
        );
    }
}

export default Follows;
