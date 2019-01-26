import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const USER_POSTS = gql`
    query UserPosts($id: Int){
        user(id: $id){
            id
            posts{
                id
                title
                created_at
                last_updated
                numLikes
                numComments
            }
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
                        return data.user.posts.map(({ id, title, created_at, last_updated, numLikes, numComments }) => {
                            return <p>{id}, {title}, {created_at}, {last_updated || 'no updates'}, {numLikes}, {numComments}</p>
                        })
                    }}
                </Query>
            </>
        );
    }
}

export default UserPosts;
