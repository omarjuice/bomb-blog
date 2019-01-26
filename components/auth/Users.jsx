import { Query } from "react-apollo";
import React, { Component } from 'react';
import gql from 'graphql-tag';



class Users extends Component {
    render() {
        const { limit, orderBy, search, order } = this.props.variables
        return (
            <Query query={gql`
                query Users($limit: Int, $order: Boolean, $orderBy: String, $search: String){
                  users(limit: $limit, order: $order, orderBy: $orderBy, search: $search){
                      id
                      username
                      created_at
                  }  
                }
            `}
                variables={{ limit, orderBy, search, order }}>
                {({ loading, error, data }) => {
                    if (loading) return <p>Loading...</p>
                    if (error) return <p>Error :(</p>
                    return (
                        <>
                            <div id="users">
                                {data.users.map(({ id, username, created_at }) => {
                                    return <p key={id}>{username} {id} {created_at}</p>
                                })}

                            </div>

                        </>
                    )
                }}
            </Query>
        );
    }
}

export default Users;
