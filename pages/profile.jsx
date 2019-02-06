import React, { Component } from 'react';
import ProfilePage from '../components/profile';

class Profile extends Component {
    static async getInitialProps({ query: { id }, req, res }) {
        if (req && !id) {
            res.writeHead(302, { Location: `/` })
            res.end()
            return {}
        }

        return { id }
    }
    render() {
        return (
            <>
                <ProfilePage id={this.props.id} />
            </>
        );
    }
}

export default Profile;
