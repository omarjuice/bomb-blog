import React, { Component } from 'react';
import Link from 'next/link'
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import moment from 'moment'
import Panels from './Panels';

const USER = gql`
    query User($id: Int){
        user(id: $id){
            id
            username
            email
            created_at
            profile{
                user_id
                about
                photo_path
                last_updated
            }
            isMe
        }
    }
`

class ProfilePage extends Component {
    render() {
        return (
            <div>
                <Link href="/">
                    <a>home</a>
                </Link>
                <Query query={USER} variables={{ id: Number(this.props.id) }} fetchPolicy="network-only">
                    {({ loading, error, data }) => {
                        if (loading) return <p>Loading...</p>;
                        if (error) return <p>ERROR</p>;
                        const { username, id, email, created_at, profile, isMe } = data.user
                        return (
                            <div className="has-background-primary">
                                <div className="columns is-centered is-multiline is-mobile has-background-light">
                                    <div id="profile-header" className="column is-half-desktop is-two-thirds-tablet is-full-mobile has-text-centered p">
                                        <figure className="image is-128x128">
                                            <img className="is-rounded" src="/static/user_image.png" />
                                        </figure>
                                        <div id="user-info" className="box">
                                            <h1 className="title is-3">
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
                                    <div className="column is-two-thirds"></div>
                                    <div className="column is-half-desktop is-two-thirds-tablet is-full-mobile has-text-centered">
                                        <div id="about" className="box">
                                            <div className="content">
                                                {profile.about || isMe ? <p>Let others know something about you!</p> : <p><strong>{username}</strong> has nothing to say...</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="column is-two-thirds"></div>
                                    <Panels userId={id} />
                                </div>
                                <style jsx>{`
                                    #profile-header{
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
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
