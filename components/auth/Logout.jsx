import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import User from './User';

const LOGOUT = gql`
    mutation Logout{
        logout
    }
`

class Logout extends Component {
    render() {
        return (
            <Mutation mutation={LOGOUT} refetchQueries={[`Authenticated`]}>
                {(logout, { loading, error, data }) => {
                    if (loading) return <button>Loading...</button>;
                    if (error) return <button>{error.message.replace(/GraphQL error: /g, '')}</button>
                    if (!data) return (
                        <>
                            <div className="navbar-item has-text-centered">
                                <User />
                                <button className="button is-warning" onClick={logout}>Logout</button>
                            </div>
                        </>
                    )
                    return <p>{data.logout ? 'LOGGED OUT' : 'NOT LOGGED OUT'}</p>
                }}
            </Mutation>
        );
    }
}

export default Logout;
