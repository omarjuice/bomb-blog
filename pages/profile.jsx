import React, { Component } from 'react';
import ProfilePage from '../components/profile';
import { setSearch, createError } from '../apollo/clientWrites';

class Profile extends Component {
    static async getInitialProps({ query: { id }, req, res }) {
        setSearch({ active: false })
        if (req && !id) {
            createError({ code: 'NOT FOUND', message: 'User not found.' })
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
