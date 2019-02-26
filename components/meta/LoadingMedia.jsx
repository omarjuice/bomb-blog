import React, { Component } from 'react';

class LoadingMedia extends Component {
    render() {
        return (
            <article className="media">
                <figure className="media-left">
                    <p className="image is-64x64">
                        <div className="block"></div>
                    </p>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <div className="line"></div>
                            <br />
                            <div className="line"></div>
                        </div>
                    </div>
                    <div className="line"></div>
                </div>
                <style jsx>{`
                .block{
                    background-color: #F0F0F0;
                    height: 64px;
                    width: 64px
                }
                .line{
                    background-color: #F0F0F0;
                    border-radius: 1rem;
                    height: .75rem;
                }
                `}</style>
            </article>
        );
    }
}

export default LoadingMedia;
