import React, { Component } from 'react';
import Link from 'next/link'
import { Query } from 'react-apollo';
import moment from 'moment'
import Panels from './Panels';
import Details from './Details'
import Loading from '../meta/Loading';
import UserTags from './UserTags';
import About from './About'
import { USER_PROFILE, CURRENT_USER } from '../../apollo/queries';
import ErrorIcon from '../meta/ErrorIcon';


class ProfilePage extends Component {
    render() {
        return (
            <div className="main-component">
                <Query query={USER_PROFILE} variables={{ id: Number(this.props.id) }}>
                    {({ loading, error, data, client }) => {
                        if (loading || error) return (
                            <div className="columns is-centered">
                                <div className="column is-one-third has-text-centered">
                                    {loading && <Loading size="10x" />}
                                    {error && <ErrorIcon size="10x" />}
                                </div>
                                <style jsx>{`
                                    .column{
                                        margin-top: 40vh;
                                    }
                                    `}</style>
                            </div>
                        )
                        const { username, id, email, created_at, profile, followingMe, imFollowing } = data.user


                        return (
                            <div>
                                <div className="columns is-centered is-multiline is-mobile">
                                    <div id="profile-header" className="column is-half-desktop is-two-thirds-tablet is-full-mobile has-text-centered p">
                                        <figure className="image is-128x128">
                                            <img className="is-rounded" src={profile.photo_path || "/static/user_image.png"} />
                                        </figure>
                                        <div id="user-info" className="box">
                                            <h1 className="title is-3 font-1">
                                                {username}
                                            </h1>
                                            <h2 className="subtitle is-6">
                                                {email}
                                                <p className="content is-size-6">
                                                    Since {moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}
                                                </p>
                                            </h2>

                                        </div>
                                    </div>
                                    <Query query={CURRENT_USER} ssr={false} fetchPolicy='cache-first'>
                                        {({ data }) => {
                                            let isMe;
                                            try {
                                                isMe = data.user.id === id
                                            } catch (e) {
                                                isMe = false
                                            }
                                            return (<> <div className="column is-two-thirds"></div>
                                                <div className="column is-half-desktop is-two-thirds-tablet is-full-mobile has-text-centered">
                                                    <div id="about" className="box">
                                                        <div className="content">
                                                            {isMe ? <About userId={id} /> : (profile.about || <p><strong>{username}</strong> has nothing to say...</p>)}
                                                        </div>
                                                        <hr />
                                                        <Details isMe={isMe} userId={id} />
                                                        <hr />
                                                        <UserTags userId={id} isMe={isMe} />
                                                    </div>
                                                </div>
                                                <div className="column is-two-thirds"></div>
                                                <Panels userId={id} isMe={isMe} />
                                            </>
                                            )
                                        }}
                                    </Query>
                                </div>
                                <style jsx>{`
                                    #profile-header{
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        margin-top: 2rem;
                                    }
                                    .icon{
                                        margin: 10px
                                    }
                                    .image{
                                        border-radius: 50%;
                                        box-shadow: 0px 1px 5px black;
                                        position: relative;
                                        z-index: 2;
                                        height: 128px important!;
                                        width: 128px important!
                                    }

                                    #user-info{
                                        height: 75%;
                                        position: relative;
                                        z-index: 1;
                                        left: -32px;
                                        width: 70%;
                                        border: 2px solid steelblue;
                                    }
                                    #user-info .title{
                                        margin-top: -1rem;
                                    }
                                    #about{
                                        position: relative;
                                        z-index: 0;
                                        top: -4rem
                                    } 
                                    @media only screen and (max-width: 400px){
                                        #user-info{
                                            left: -24px;
                                        }
                                        .image{
                                            box-shadow: none;
                                        }
                                    }
                                    `}</style>
                            </div>
                        )
                    }}
                </Query>
            </div>
        );
    }
}

export default ProfilePage;
