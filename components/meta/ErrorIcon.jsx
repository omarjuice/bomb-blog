import React, { Component } from 'react';

class ErrorIcon extends Component {
    render() {
        return (<div>
            <span className={`icon has-text-${this.props.color || ''}`}><i className={`fas ${this.props.size ? `fa-${this.props.size}` : ''} fa-exclamation-circle`}></i></span>
            <style jsx>{`
                .icon{
                    ${this.props.style}
                }
                `}</style>
        </div>
        );
    }
}

export default ErrorIcon;
