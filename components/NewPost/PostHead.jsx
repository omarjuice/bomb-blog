import React, { Component } from 'react';
import BombSVG from '../svg/bomb';
import Follow from '../global/Follow';

class PostHead extends Component {
    render() {
        const { getTags, title, caption } = this.props
        return (
            <div>
                <div className={`media`}>
                    <div className="media-center">
                        <img src={`/static/user_image.png`} className="author-image" />
                    </div>
                    <div className="media-content has-text-centered">
                        <p id="title" className="title is-1 article-title font-2">{title}</p>
                        <div className="caption content is-size-3">
                            <div className="columns is-mobile is-centered">
                                <div className="column is-1"><i className="fas fa-quote-left fa-pull-left"></i></div>
                                <div id="caption" className="column is-9">{caption}</div>
                                <div className="column is-1"><i className="fas fa-quote-right fa-pull-left"></i></div>
                            </div>

                        </div>
                        <hr />
                        <div className="columns is-mobile is-centered is-multiline">
                            <div className="column is-2 is-1-mobile"></div>
                            <div className="column is-2 has-text-centered">
                                <div>
                                    <>
                                        <a className="has-text-primary has-text-centered">
                                            <span className="icon is-large">
                                                <BombSVG lit={true} scale={this.props.scale || 1.2} />
                                            </span>
                                        </a>
                                        <br />
                                        <a className="is-size-4 font-1 has-text-dark underline">0</a>
                                    </>
                                </div>
                            </div>
                            <div className="column is-2 is-hidden-tablet"></div>
                            <div className="post-stats column is-6 has-text-centered">
                                <div className="subtitle is-6 article-subtitle has-text-centered">
                                    <a>@{'username'}</a>
                                    <br />
                                    at {'12:37pm on December 11th, 2018'}
                                    <br />
                                    {<Follow />}
                                </div>
                            </div>
                            <div className="column is-8-desktop is-8-tablet is-full-mobile">
                                {<div className="tags">
                                    {getTags().map((tag, i) => {
                                        return <a key={tag} className={`tag is-rounded font-2 is-medium ${i % 2 === 1 ? 'is-primary' : 'is-info'}`}>{tag}</a>
                                    })}
                                </div>}
                            </div>
                        </div>
                    </div>
                </div>
                <style jsx>{`
                .author-image {
                        position: absolute;
                        top: -30px;
                        left: 50%;
                        width: 60px;
                        height: 60px;
                        margin-left: -30px;
                        border: 3px solid #ccc;
                        border-radius: 50%;
                        box-shadow: 0px 1px 1px gray;
                    }
                    .media-center {
                        display: block;
                        margin-bottom: 1rem;
                    }
                    .media-content {
                        margin-top: 3rem;
                        overflow: visible
                    }
 
                    .article-subtitle {
                        color: #909AA0;
                        margin-bottom: 3rem;
                    }
                    .post-stats{
                        display: flex;
                        align-items: center;
                    }
                    #caption, #title{
                        word-break: break-word
                    }
                    `}</style>
            </div>
        );
    }
}

export default PostHead;
