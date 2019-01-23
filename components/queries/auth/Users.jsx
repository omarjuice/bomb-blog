import { Query } from "react-apollo";
import React, { Component } from 'react';
import gql from 'graphql-tag';



class Users extends Component {
    render() {
        return (
            <Query query={gql`
                {
                  users{
                      id
                      username
                  }  
                }
            `}>
                {({ loading, error, data }) => {
                    if (loading) return <p>Loading...</p>
                    if (error) return <p>Error :(</p>
                    return data.users.map(({ id, username }) => {
                        return <p key={id}>{username}</p>
                    })
                }}

            </Query>
        );
    }
}

export default Users;
