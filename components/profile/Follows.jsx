import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const FOLLOWERS = gql`
    query Followers($id: Int){
        user(id: $id){
            id
            followers{
                id
                username
                followed_at
            }
        }
    }
`
const FOLLOWING = gql`
    query Followers($id: Int){
        user(id: $id){
            id
            following{
                id
                username
                followed_at
            }
        }
    }
`
const queries = {
    FOLLOWING, FOLLOWERS
}

class Follows extends Component {
    render() {
        return (
            <>
                <h1 className="title is-2">
                    {this.props.display}
                </h1>
                <Query query={queries[this.props.display.toUpperCase()]} variables={{ id: this.props.userId }}>
                    {({ loading, error, data }) => {
                        if (loading) return <p>Loading...</p>;
                        if (error) return <p>ERROR</p>;
                        return data.user[this.props.display].map(({ id, username, followed_at }) => {
                            return <p>{id}, {username}, {followed_at}</p>
                        })
                    }}
                </Query>
            </>
        );
    }
}

export default Follows;
