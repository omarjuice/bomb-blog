import React, { Component } from 'react';
import Login from '../auth/Login';
import Register from '../auth/Register';
import { Query } from 'react-apollo';
import { hideModal, clearError } from '../../apollo/clientWrites';
import Likers from '../posts/Likers';
import { GET_MODAL } from '../../apollo/queries';


const dismiss = () => {
    hideModal()
    clearError()
}
class Modal extends Component {

    render() {
        const getDisplay = (display, info) => {
            if (info) {
                info = JSON.parse(info)
            }
            const displays = {
                Login: <Login onSuccess={dismiss} />,
                Register: <Register onSuccess={dismiss} />,
                Likers: <Likers info={info} />
            }
            return displays[display]
        }
        return (
            <Query query={GET_MODAL}>
                {({ data }) => {
                    if (!data) return <div></div>;
                    const { active, message, display, info } = data.modal
                    return (
                        <div className={`modal ${active && 'is-active'}`}>
                            <div className="modal-background" onClick={dismiss}></div>
                            <div className="modal-card">
                                <header className="modal-card-head has-text-centered">
                                    <p className="modal-card-title font-2">{message || display}</p>
                                    <button className="delete" aria-label="close" onClick={dismiss}></button>
                                </header>
                                <section className="modal-card-body has-text-centered">
                                    {getDisplay(display, info)}
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
