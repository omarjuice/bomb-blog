import React, { Component } from 'react';
import moment from 'moment'
import Unfollow from '../global/UnFollow';
import Follow from '../global/Follow';
import BombSVG from '../svg/bomb';
import { setSearch } from '../../apollo/clientWrites';
import LinkWrap from '../global/LinkWrap';

class Users extends Component {
    state = {
        fetchMore: false
    }
    render() {
        const { data } = this.props
        return (
            <>
                {data.results.map(({ id, username, imFollowing, followingMe, isMe, profile, tags, created_at }, i) => {
                    return <article key={id} className="media has-text-centered">
                        <figure className="media-left">
                            <span>{i + 1}</span>
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
                                    {profile.about}
                                    <br />
                                    {tags.map((tag, i) => (
                                        <a onClick={() => setSearch({ addToInput: ` #${tag.tag_name}`, active: true })} key={tag.id}
                                            className={`tag font-1 ${this.props.inputTags.includes(tag.tag_name) ? 'is-primary' : ''}`}>{tag.tag_name}</a>
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
                            <BombSVG lit={false} face={{ happy: false }} />
                        </div>
                    </figure>
                    <div className="media-content font-1 has-text-centered">
                        <div className="content has-text-centered">
                            <h3 className="subtitile is-3">
                                No {data.results.length > 0 ? 'more' : ''} Users to show...
                        </h3>

                        </div>
                    </div>
                </article> : ''}
            </>
        );
    }
}

export default Users;
