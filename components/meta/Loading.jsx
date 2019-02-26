import React, { Component } from 'react';
import BombSVG from '../svg/bomb';
class Loading extends Component {
    render() {
        return (
            <span>
                <span className={`icon is-large has-text-${this.props.color || ''}`}>
                    {/* <i className={`fas fa-spin ${this.props.size ? `fa-${this.props.size}` : ''} fa-cog`}></i> */}
                    <BombSVG lit={true} scale={this.props.scale || 1} animated={true} />
                </span>
                {/* <style jsx>{`
                    .icon{
                        ${this.props.style}
                    }
                    `}</style> */}
            </span>
        );
    }
}

export default Loading;