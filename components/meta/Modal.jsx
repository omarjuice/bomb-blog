import React, { Component } from 'react';
import Login from '../auth/Login';
import Register from '../auth/Register';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { hideModal, clearError } from '../../apollo/clientWrites';

const GET_MODAL = gql`
    query GetModal{
        modal @client{
            active
            message
            display
        }
    }
`
const dismiss = () => {
    hideModal()
    clearError()
}
class Modal extends Component {
    displays = {
        Login: (<Login onSuccess={dismiss} />),
        Register: (<Register onSuccess={dismiss} />)
    }
    render() {
        return (
            <Query query={GET_MODAL}>
                {({ data, client }) => {
                    if (!data) return <div></div>;
                    const { active, message, display } = data.modal
                    return (
                        <div className={`modal ${active && 'is-active'}`}>
                            <div className="modal-background" onClick={dismiss}></div>
                            <div className="modal-card">
                                <header className="modal-card-head has-text-centered">
                                    <p className="modal-card-title font-2">{message || display}</p>
                                    <button className="delete" aria-label="close" onClick={dismiss}></button>
                                </header>
                                <section className="modal-card-body has-text-centered">
                                    {this.displays[display]}
                                </section>
                                <footer className="modal-card-foot has-text-centered">
                                </footer>
                            </div>
                        </div>
                    )
                }}
            </Query>
        );
    }
}

export default Modal;
