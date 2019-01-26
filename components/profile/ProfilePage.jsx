import React, { Component } from 'react';
import Link from 'next/link'
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

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
                <Query query={USER} variables={{ id: Number(this.props.id) }} >
                    {({ loading, error, data }) => {
                        if (loading) return <p>Loading...</p>;
                        if (error) return <p>ERROR</p>;
                        const { username, id, email, created_at, profile } = data.user
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
                                                <p className="content is-size-7">
                                                    Since {created_at}
                                                </p>
                                            </h2>

                                        </div>
                                    </div>
                                    <div className="column is-two-thirds"></div>
                                    <div className="column is-half-desktop is-two-thirds-tablet is-full-mobile has-text-centered">
                                        <div id="about" className="box">
                                            <p className="content">
                                                {profile.about}
                                            </p>
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
                                        border: 5px solid lightgray;
                                        border-radius: 50%;
                                        box-shadow: 0px 1px 5px black;
                                        position: relative;
                                        z-index: 2;
                                    }
                                    #user-info{
                                        height: 75%;
                                        position: relative;
                                        z-index: 1;
                                        left: -32px;
                                        width: 70%;
                                        box-shadow: 1px 0px 1px black;
                                    }
                                    #about{
                                        position: relative;
                                        z-index: 0;
                                        top: -4rem
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
