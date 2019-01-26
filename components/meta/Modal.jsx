import React, { Component } from 'react';
import Login from '../auth/Login';
import Register from '../auth/Register';

class Modal extends Component {
    displays = {
        Login: (<Login onSuccess={this.props.toggle} />),
        Register: (<Register onSuccess={this.props.toggle} />)
    }
    onSuccess = () => {

    }
    render() {
        return (
            <div className={`modal ${this.props.active && 'is-active'}`}>
                <div className="modal-background" onClick={this.props.toggle}></div>
                <div className="modal-card">
                    <header className="modal-card-head has-text-centered">
                        <p className="modal-card-title">{this.props.display}</p>
                        <button className="delete" aria-label="close" onClick={this.props.toggle}></button>
                    </header>
                    <section className="modal-card-body">
                        {this.displays[this.props.display]}
                    </section>
                    <footer className="modal-card-foot has-text-centered">
                    </footer>
                </div>
            </div>
        );
    }
}

export default Modal;
