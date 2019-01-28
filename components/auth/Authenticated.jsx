import React, { Component } from 'react';
import { Query } from 'react-apollo';
import Logout from './Logout';
import Loading from '../meta/Loading';
import { AUTHENTICATED } from '../../apollo/queries';





class Authenticated extends Component {
    render() {
        return (
            <Query query={AUTHENTICATED} ssr={false} >
                {({ loading, error, data }) => {
                    if (loading) return <Loading />;
                    if (error) return <p>{error.message.replace(/GraphQL error: /g, '')}</p>;
                    return data.authenticated ? <Logout /> : <>
                        <div className="navbar-item has-text-centered">
                            <a className="button is-link font-1" onClick={this.props.handleClick('Register')}>
                                <strong>Sign up</strong>
                            </a>
                        </div>
                        <div className="navbar-item has-text-centered">
                            <a className="button is-light font-1" onClick={this.props.handleClick('Login')}>
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
