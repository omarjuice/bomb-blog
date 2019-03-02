import React, { Component } from 'react';
import BombSVG from '../components/svg/bomb';

class Error extends Component {
    render() {
        return (
            <div className="main-component">
                <div className="columns is-centered is-vcentered">
                    <div className="column has-text-centered">
                        <BombSVG scale={.25} />
                        <article className="message is-dark">
                            <div className="message-header">
                                <p>Oh no!</p>

                            </div>
                            <div className="message-body">
                                There was an error somewhere. Try refreshing the page!
                    </div>
                        </article>
                    </div>

                </div>
                <style jsx>{`
                    .columns{
                        height: 100%;
                    }
                    .column{
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center
                    }
                `}</style>
            </div>
        );
    }
}

export default Error;
