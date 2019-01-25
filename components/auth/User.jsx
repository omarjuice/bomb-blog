import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const USER = gql`
    query User{
        user{
            id
            username
        }
    }
`

class User extends Component {
    render() {
        return (
            <Query query={USER}>
                {({ loading, error, data }) => {
                    if (loading) return <p>Loading...</p>;
                    if (error) return <p>{error.message.replace(/GraphQL error: /g, '')}</p>;
                    return (
                        <a id="greeting">
                            <p><em>Hey there, </em><strong>{data.user.username}</strong>!</p>
                            <style jsx>{`
                                p{
                                    margin-right: 10px
                                }
                            `}</style>
                        </a>
                    )
                }}
            </Query>
        );
    }
}

export default User;
