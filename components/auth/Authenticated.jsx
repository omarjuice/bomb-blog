import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Logout from './Logout';



const AUTHENTICATED = gql`
    query Authenticated{
        authenticated
    }
`

class Authenticated extends Component {
    render() {
        return (
            <Query query={AUTHENTICATED}  >
                {({ loading, error, data }) => {
                    if (loading) return <p>Loading...</p>;
                    if (error) return <p>{error.message.replace(/GraphQL error: /g, '')}</p>;
                    return data.authenticated ? <Logout /> : <>
                        <div className="navbar-item has-text-centered">
                            <a className="button is-link" onClick={this.props.handleClick('Register')}>
                                <strong>Sign up</strong>
                            </a>
                        </div>
                        <div className="navbar-item has-text-centered">
                            <a className="button is-light" onClick={this.props.handleClick('Login')}>
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
