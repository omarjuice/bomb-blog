import React, { Component } from 'react';
import Link from 'next/link';
import moment from 'moment'
import Unfollow from '../global/UnFollow';
import Follow from '../global/Follow';
import { SEARCH_USERS } from '../../apollo/queries';
import { Query } from 'react-apollo';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import BomgSVG from '../svg/bomb';

class Users extends Component {
    state = {
        fetchMore: false
    }
    render() {
        const { data, input } = this.props
        console.log(data);
        if (data && data.results.length === 0) {
            return (
                <article className="media">
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

                </article>
            )
        }
        const nextInput = { ...input, cursor: data.cursor }
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
                {!this.state.fetchMore ?
                    <article className="media">
                        <div className="media-content font-2 has-text-centered">
                            <div className="content has-text-centered">
                                <button onClick={() => this.setState({ fetchMore: true })} className="button is-large is-primary font-2">More</button>
                            </div>
                        </div>
                    </article>
                    :
                    <Query query={SEARCH_USERS} variables={{ input: nextInput }}>
                        {({ loading, error, data }) => {
                            if (loading || error) return (
                                <article className="media">
                                    <div className="media-content font-2 has-text-centered">
                                        <div className="content has-text-centered">
                                            {loading && <Loading size="4x" style="margin-top:2rem" />}
                                            {error && <ErrorIcon size="4x" style="margin-top:2rem" />}
                                        </div>
                                    </div>
                                </article>
                            )
                            return <Users data={data.users} input={nextInput} />
                        }}
                    </Query>
                }
            </>
        );
    }
}

export default Users;
