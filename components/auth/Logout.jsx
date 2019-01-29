import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import User from './User';
import { LOGOUT } from '../../apollo/mutations';


class Logout extends Component {
    render() {
        return (
            <Mutation mutation={LOGOUT} refetchQueries={[`Authenticated`, `CurrentUser`, `User`]}>
                {(logout, { loading, error, data, client }) => {
                    if (loading) return <button>Loading...</button>;
                    if (error) return <button>{error.message.replace(/GraphQL error: /g, '')}</button>
                    if (!data) return (
                        <>
                            <div className="navbar-item has-text-centered">
                                <User />
                                <button className="button is-warning font-1" onClick={() => logout() && client.resetStore()}>Logout</button>
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
