import React, { Component } from 'react';
import { Query } from 'react-apollo';
import moment from 'moment'
import Panels from './Panels';
import Details from './Details'
import UserTags from './UserTags';
import About from './About'
import ErrorIcon from '../meta/ErrorIcon';
import UploadImage from './UploadImage';
import { USER_PROFILE, CURRENT_USER } from '../../apollo/queries';


class ProfilePage extends Component {
    state = {
        image: null,
        editingImage: false
    }
    setPreviewImage(image) {
        if (image) {
            this.setState({ image: URL.createObjectURL(image) })
        } else {
            this.setState({ image: '/static/user_image.png' })
        }

    }
    cancelEdit(image) {
        this.setState({
            editingImage: false,
            image
        })
    }
    render() {
        const { username, id, email, created_at, profile } = this.props.user
        return (
            <div className="main-component">
                <div>
                    <div className="columns is-centered is-multiline is-mobile">
                        <div id="profile-header" className="column is-half-desktop is-two-thirds-tablet is-full-mobile has-text-centered">
                            <figure className="image is-128x128">
                                <img className="is-rounded" src={this.state.image || profile.photo_path || "/static/user_image.png"} />
                                <Query query={CURRENT_USER} ssr={false}>
                                    {({ data }) => {
                                        let isMe;
                                        try {
                                            isMe = data.user.id === id
                                        } catch (e) {
                                            isMe = false
                                        }
                                        return isMe ? <a onClick={() => this.setState({ editingImage: !this.state.editingImage, image: profile.photo_path })} className="edit has-text-grey">
                                            <span className="icon">
                                                {this.state.editingImage ? <i className="fas fa-times-circle fa-lg"></i> : <i className="fas fa-camera-retro fa-2x"></i>}
                                            </span>
                                        </a> : ''
                                    }}
                                </Query>
                            </figure>
                            <div id="user-info" className="box bordered">
                                <h1 className="title is-3 is-size-4-mobile font-1">
                                    {username}
                                </h1>

                                <h2 className="subtitle is-6">
                                    {this.state.editingImage ? <UploadImage original={profile.photo_path} cancelEdit={this.cancelEdit.bind(this)} setPreviewImage={this.setPreviewImage.bind(this)} /> :
                                        <>
                                            {email}
                                            <p className="content is-size-6">
                                                Since {moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}
                                            </p>
                                        </>}
                                </h2>
                            </div>
                        </div>
                        <Query query={CURRENT_USER} ssr={false} >
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
                                    
                                    .image{
                                        border-radius: 50%;
                                        position: relative;
                                        z-index: 2;
                                        height: 128px important!;
                                        width: 128px important!
                                    }import LoadingMedia from '../meta/LoadingMedia';


                                    #user-info{
                                        height: 75%;
                                        position: relative;
                                        z-index: 1;
                                        left: -32px;
                                        width: 70%;
                                        overflow: scroll;
                                        -webkit-overflow-scrolling: touch;
                                    }
                                    .bordered{
                                        border: 2px solid steelblue;
                                    }
                        
                                    #user-info .title{
                                        margin-top: -1rem;
                                    }
                                    .image .edit{
                                        position: absolute;
                                        right: 0rem;
                                        bottom: 1rem;
                                        z-index: 10;
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
            </div>
        );
    }
}

export default ProfilePage;
