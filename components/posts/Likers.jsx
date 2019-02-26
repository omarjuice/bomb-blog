import React, { Component } from 'react';
import { Query } from 'react-apollo';
import moment from 'moment'
import Loading from '../meta/Loading';
import Follow from '../global/Follow';
import Unfollow from '../global/UnFollow';
import ErrorIcon from '../meta/ErrorIcon';
import { LIKERS, COMMENT_LIKERS } from '../../apollo/queries';
import LinkWrap from '../global/LinkWrap';

class Likers extends Component {
    render() {
        const { type, id } = this.props.info
        const query = type === 'post' ? LIKERS : type === 'comment' ? COMMENT_LIKERS : null
        if (!query) return <ErrorIcon size="4x" color="primary" />;
        return (
            <Query query={query} variables={{ id }}>
                {({ loading, error, data }) => {
                    if (loading) return <Loading />;
                    if (error) return <ErrorIcon size="4x" color="primary" />;
                    return (<div className="columns is-centered is-mobile">
                        <div className="column box is-three-fifths-desktop is-two-thirds-tablet is-four-fifths-mobile">
                            {data[type].likers.map(({ id, username, liked_at, imFollowing, followingMe, isMe, profile }) => {
                                return <article key={id} className="media has-text-centered">
                                    <figure className="media-left">
                                        <p className="image is-48x48">
                                            <img src={profile.photo_path || `/static/user_image.png`} />
                                        </p>
                                    </figure>
                                    <div className="media-content">
                                        <div className="content">
                                            <p>
                                                <LinkWrap profile={{ id, username }} >
                                                    <a>
                                                        <strong>{isMe ? <em>You</em> : username} </strong>
                                                    </a>
                                                </LinkWrap>

                                                <br />
                                                <small>
                                                    {moment.utc(Number(liked_at)).local().fromNow()}
                                                </small>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="media-right columns is-multiline is-mobile is-centered">
                                        <div className="column is-half has-text-centered">
                                            {isMe ? <span className="icon">
                                                <i className={`fas fa-lg fa-user has-text-warning`}></i>
                                            </span> : imFollowing ? <Unfollow userId={id} size="small" /> : <Follow userId={id} size="small" />}
                                        </div>
                                        <div className="column is-half has-text-centered">
                                            {followingMe ? <span className="icon"><i className="fas fa-lg fa-user-check has-text-success"></i></span> : ''}
                                        </div>
                                    </div>
                                    <style jsx>{`
                                        .media-right{
                                            position: relative;
                                            top: 10px;
                                        }
                                        `}</style>
                                </article>
                            })}
                        </div>
                    </div>)
                }}
            </Query>
        );
    }
}

export default Likers;
