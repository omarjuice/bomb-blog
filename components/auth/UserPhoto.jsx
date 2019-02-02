import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { CURRENT_USER } from '../../apollo/queries';

class UserPhoto extends Component {
    render() {
        return (
            <Query query={CURRENT_USER} ssr={false} >
                {({ data }) => {
                    let photo_path;
                    try {
                        photo_path = data.user.profile.photo_path
                    } finally {
                        return <img src={photo_path || "/static/user_image.png"} alt="" />
                    }
                }}
            </Query>
        );
    }
}

export default UserPhoto;
