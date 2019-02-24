import React, { Component } from 'react';
import { Query } from 'react-apollo';
import Link from 'next/link'
import moment from 'moment'
import Loading from '../meta/Loading';
import Follow from '../global/Follow';
import Unfollow from '../global/UnFollow';
import ErrorIcon from '../meta/ErrorIcon';
import BombSVG from '../svg/bomb';
import { FOLLOWING, FOLLOWERS } from '../../apollo/queries';


const queries = { FOLLOWING, FOLLOWERS }

class FollowPanel extends Component {
    render() {
        const { display } = this.props
        return (
            <div className="columns is-centered is-mobile is-multiline">
                <div className="column is-full">
                    <h1 className="title is-2 font-1">
                        {display}
                    </h1>
                </div>

                <Query query={queries[display.toUpperCase()]} variables={{ id: this.props.userId }}>
                    {({ loading, error, data }) => {
                        if (loading) return <Loading color="primary" size="4x" style="margin-top: 10px" />;
                        if (error) return <ErrorIcon color="primary" size="4x" style="margin-top: 10px" />
                        if (data.user[display].length < 1) {
                            return (
                                <div>
                                    <BombSVG scale={.5} face={{ happy: false }} />
                                    <hr />
                                    <h1 className="subtitle is-4 font-1">{data.user.isMe ? `You ${display === 'following' ? 'are not following anyone.' : 'have no followers'}` : `${data.user.username} has no ${display}.`}</h1>
                                    <style jsx>{`
                                        .icon{
                                            margin-top: 10px
                                        }
                                        `}</style>
                                </div>

                            )
                        }
                        return <div className="column box is-three-fifths-desktop is-two-thirds-tablet is-11-mobile">
                            {data.user[display].map(({ id, username, followed_at, imFollowing, followingMe, isMe, profile }) => {
                                return <article key={id} className="media has-text-centered">
                                    <figure className="media-left">
                                        <p className="image is-48x48">
                                            <img src={profile.photo_path || `/static/user_image.png`} />
                                        </p>
                                    </figure>
                                    <div className="media-content">
                                        <div className="content">
                                            <p>
                                                <Link href={{ pathname: '/profile', query: { id: id } }} >
                                                    <a>
                                                        <strong>{isMe ? <em>You</em> : username} </strong>
                                                    </a>
                                                </Link>

                                                <br />
                                                <small>
                                                    Followed {moment.utc(Number(followed_at)).local().format('M/DD/YY')}
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
                    }}
                </Query>
            </div>
        );
    }
}

export default FollowPanel;
