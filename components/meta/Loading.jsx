import React, { Component } from 'react';


class Loading extends Component {

    render() {
        return (
            <span>
                <span className={`icon has-text-${this.props.color || ''}`}><i className={`fas fa-spin ${this.props.size ? `fa-${this.props.size}` : ''} fa-cog`}></i></span>
                <style jsx>{`
                    .icon{
                        ${this.props.style}
                    }
                    `}</style>
            </span>
        );
    }
}

export default Loading;