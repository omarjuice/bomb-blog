import React, { Component } from 'react';
import { Query } from 'react-apollo';
import Logout from './Logout';
import Loading from '../meta/Loading';
import { AUTHENTICATED } from '../../apollo/queries';
import { showModal } from '../../apollo/clientWrites';
class Authenticated extends Component {
    render() {
        return (
            <Query query={AUTHENTICATED} ssr={false} >
                {({ loading, error, data, client }) => {
                    if (loading) return <Loading scale={.2} color="white" />;
                    if (error) return <p>{error.message.replace(/GraphQL error: /g, '')}</p>;
                    return data.authenticated ? <Logout /> : <>
                        <div className="navbar-item has-text-centered">
                            <a className="button is-link font-1" onClick={() => showModal({ display: 'Register', message: '', active: true })}>
                                <strong>Sign up</strong>
                            </a>
                        </div>
                        <div className="navbar-item has-text-centered">
                            <a className="button is-light font-1" onClick={() => showModal({ display: 'Login', message: '', active: true })}>
                                Log in
                            </a>
                        </div>
                    </>
                }}
            </Query>
        );
    }
}

export default Authenticated;
