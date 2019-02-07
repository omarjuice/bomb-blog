import React, { Component } from 'react';
import Link from 'next/link';
import moment from 'moment'
import Unfollow from '../global/UnFollow';
import Follow from '../global/Follow';

import BomgSVG from '../svg/bomb';

class Users extends Component {
    state = {
        fetchMore: false
    }
    render() {
        const { data } = this.props
        return (
            <>
                {data.results.map(({ id, username, imFollowing, followingMe, isMe, profile, tags, created_at }) => {
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
                                    {profile.about}
                                    <br />
                                    {tags.map((tag, i) => (
                                        <span key={tag.id} className={`tag font-2 ${i % 2 === 0 ? 'is-primary' : 'is-info'}`}>{tag.tag_name}</span>
                                    ))}
                                    <br />
                                    <small>Since {moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}</small>
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
                {this.props.end ? <article className="media">
                    <figure className="media-left">
                        <div className="image is-64x64">
                            <BomgSVG lit={false} face={{ happy: false }} />
                        </div>
                    </figure>
                    <div className="media-content font-2 has-text-centered">
                        <div className="content has-text-centered">
                            <h3 className="subtitile is-3">
                                No Users to show...
                        </h3>

                        </div>
                    </div>
                </article> : ''}
            </>
        );
    }
}

export default Users;
