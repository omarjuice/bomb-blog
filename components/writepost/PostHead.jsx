import React, { Component } from 'react';
import { Query } from 'react-apollo';
import moment from 'moment';
import BombSVG from '../svg/bomb';
import { CURRENT_USER } from '../../apollo/queries';

class PostHead extends Component {
    render() {
        const { tags, title, caption, image } = this.props
        return (
            <div className="has-text-centered">
                <div className={`media`}>
                    <Query query={CURRENT_USER}>
                        {({ data }) => {
                            let photo_path;
                            let username
                            try {
                                username = data.user.username
                                photo_path = data.user.profile.photo_path
                            } catch (e) {
                                username = null
                                photo_path = null
                            }
                            return (<>
                                <div className="media-center">
                                    <img src={photo_path || `/static/user_image.png`} className="author-image" />
                                </div>
                                <div className="media-content has-text-centered">
                                    <p id="title" className="title is-1 article-title font-1">{title}</p>
                                    <div className="caption content is-size-3">
                                        <div className="columns is-mobile is-centered">
                                            <div className="column is-1 has-text-left is-paddingless"><i className="fas fa-quote-left fa-pull-left"></i></div>
                                            <div id="caption" className="column is-9 has-text-centered is-paddingless">{caption}</div>
                                            <div className="column is-1 has-text-right is-paddingless"><i className="fas fa-quote-right fa-pull-right"></i></div>
                                        </div>

                                    </div>
                                    <hr />
                                    <div className="columns is-mobile is-centered is-multiline">
                                        <div className="column is-2 is-1-mobile"></div>
                                        <div className="column is-2 has-text-centered">
                                            <div>
                                                <a className="has-text-primary has-text-centered">
                                                    <span className="icon is-large bomb">
                                                        <BombSVG lit={true} scale={this.props.scale || 1.2} />
                                                    </span>
                                                </a>
                                                <br />
                                                <a className="is-size-4 font-1 has-text-dark underline">0</a>
                                            </div>
                                        </div>
                                        <div className="column is-2 is-hidden-tablet"></div>
                                        <div className="post-stats column is-6 has-text-centered">
                                            <div className="subtitle is-6 article-subtitle has-text-centered">
                                                <a>@{username || 'username'}</a>
                                                <br />
                                                at {moment.utc(Date.now()).local().format(' h:mma on MMMM Do, YYYY')}
                                                <br />

                                                <span className="icon hover-icon">
                                                    <i className={`fas fa-lg fa-user-plus has-text-info`}></i>
                                                </span>

                                            </div>
                                        </div>

                                        <div className="column is-8-desktop is-8-tablet is-full-mobile">
                                            {<div className="tags">
                                                {tags.map((tag, i) => {
                                                    return <a key={tag} className={`tag is-rounded font-1 is-medium ${i % 2 === 1 ? 'is-primary' : 'is-dark'}`}>{tag}</a>
                                                })}
                                            </div>}
                                        </div>
                                    </div>

                                </div>
                            </>
                            )
                        }}


                    </Query>
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
                    
                    #caption, #title{
                        word-break: break-word
                    }
                    .bomb{
                        position: relative;
                        left: -0.25rem
                    }
                    `}</style>
                {image ? <figure className="image is-128by128">
                    <img src={image} alt="image" />
                </figure> : null}
            </div>
        );
    }
}

export default PostHead;
