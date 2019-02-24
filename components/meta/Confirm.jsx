import React, { Component } from 'react';
import { renderModal } from '../../apollo/clientWrites';

class Confirm extends Component {
    render() {
        return (
            <div>
                <h1 className="title is-4">{this.props.info.prompt || 'Are You Sure ?'}</h1>
                <div className="columns is-mobile">
                    <div className="column">
                        <button onClick={() => renderModal({ confirmation: true })} className="button font-1 is-large is-info">
                            Yes
                </button>
                    </div>
                    <div className="column">
                        <button onClick={() => renderModal({ confirmation: false })} className="button font-1 is-large is-text">
                            No
                </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Confirm;
