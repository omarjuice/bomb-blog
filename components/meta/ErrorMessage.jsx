import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { ERROR } from '../../apollo/queries';
import { clearError, renderModal } from '../../apollo/clientWrites';

class ErrorMessage extends Component {
    messageComponents = {
        UNAUTHENTICATED: <div><a onClick={() => renderModal({ display: 'Login', message: '', active: true })} >You must be logged in to do that. Click to log in.</a></div>
    }
    render() {
        return (
            <Query query={ERROR}>
                {({ data }) => {
                    if (!data || !data.error.exists || !!this.props.globalScope !== data.error.global) return <div></div>
                    return (
                        <div className="columns is-centered is-mobile">
                            <div className="column is-two-fifths-desktop is-two-thirds-tablet is-10-mobile">
                                <article className={`message is-dark ${!data.error.exists && 'is-invisible'}`}>
                                    <div className="message-header">
                                        <p ></p>
                                        <button className="delete is-pulled-right" aria-label="delete"
                                            onClick={clearError}></button>
                                    </div>
                                    <div className="message-body">

                                        {this.messageComponents[data.error.code] || data.error.message || 'ERROR MESSAGE'}

                                    </div>
                                </article>
                            </div>
                            <style jsx>{`
                                .message{
                                    margin-top: 10px
                                }
                                `}</style>
                        </div>
                    )
                }
                }

            </Query>

        );
    }
}

export default ErrorMessage;
