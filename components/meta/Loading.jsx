import React, { Component } from 'react';
import BombSVG from '../svg/bomb';
class Loading extends Component {
    render() {
        return (
            <span className={`icon is-large`}>
                <BombSVG lit={true} scale={this.props.scale || 1} animated={true} />
            </span>
        );
    }
}

export default Loading;