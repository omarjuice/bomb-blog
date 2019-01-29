import React, { Component } from 'react';

class ErrorMessage extends Component {
    render() {
        return (

            <article class="message">
                <div class="message-body">
                    {this.props.message}
                </div>
            </article>

        );
    }
}

export default ErrorMessage;
