import React, { Component } from 'react';
import ProfilePage from '../components/profile';
import { setSearch } from '../apollo/clientWrites';

class Profile extends Component {
    static async getInitialProps({ query: { id }, req, res }) {
        setSearch({ active: false })
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
