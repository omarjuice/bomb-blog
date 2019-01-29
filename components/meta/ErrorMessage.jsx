import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { ERROR } from '../../apollo/queries';
import { clearError } from '../../apollo/clientWrites';

class ErrorMessage extends Component {
    render() {
        return (
            <Query query={ERROR}>
                {({ data }) => {
                    if (!data || !data.error.exists) return <div></div>
                    return (
                        <div className="columns is-centered is-mobile">
                            <div className="column is-two-fifths-desktop is-two-thirds-tablet is-10-mobile">
                                <article className={`message is-warning ${!data.error.exists && 'is-invisible'}`}>
                                    <div className="message-header">
                                        <p>{data.error.code}</p>
                                        <button className="delete" aria-label="delete"
                                            onClick={clearError}></button>
                                    </div>
                                    <div className="message-body">
                                        {data.error.message || 'ERROR MESSAGE'}
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
