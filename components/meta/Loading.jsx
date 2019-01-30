import React, { Component } from 'react';


class Loading extends Component {

    render() {
        return (
            <div>
                <span className={`icon has-text-${this.props.color || ''}`}><i className={`fas fa-spin ${this.props.size ? `fa-${this.props.size}` : ''} fa-compact-disc`}></i></span>
                <style jsx>{`
                    .icon{
                        ${this.props.style}
                    }
                    `}</style>
            </div>
        );
    }
}

export default Loading;