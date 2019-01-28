import { Query } from "react-apollo";
import React, { Component } from 'react';
import Loading from "../meta/Loading";
import { USERS } from '../../apollo/queries';



class Users extends Component {
    render() {
        const { limit, orderBy, search, order } = this.props.variables
        return (
            <Query query={USERS}
                variables={{ limit, orderBy, search, order }}>
                {({ loading, error, data }) => {
                    if (loading) return <Loading />
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
