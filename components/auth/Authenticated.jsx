import React, { Component } from 'react';
import { Query } from 'react-apollo';
import Logout from './Logout';
import Loading from '../meta/Loading';
import { AUTHENTICATED } from '../../apollo/queries';
import { renderModal } from '../../apollo/clientWrites';
class Authenticated extends Component {
    openModal = (display) => {
        return () => renderModal({ display, message: '', active: true })
        this.props.deactivateMenu()
    }
    render() {
        return (
            <Query query={AUTHENTICATED} ssr={false} >
                {({ loading, data }) => {
                    if (loading) return null
                    return data && data.authenticated ? <Logout deactivateMenu={this.props.deactivateMenu} /> : <>
                        <div className="navbar-item has-text-centered">
                            <a className="button is-ligh font-1 " onClick={this.openModal('Register')}>
                                <strong>Sign up</strong>
                            </a>
                        </div>
                        <div className="navbar-item has-text-centered">
                            <a className="button is-white font-1 " onClick={this.openModal('Login')}>
                                <strong>Log in</strong>
                            </a>
                        </div>
                    </>
                }}
            </Query>
        );
    }
}

export default Authenticated;
