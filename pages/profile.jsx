import React, { Component } from 'react';
import ProfilePage from '../components/profile';
import { setSearch, createError } from '../apollo/clientWrites';
import { USER_PROFILE } from '../apollo/queries';

class Profile extends Component {
    static async getInitialProps({ query: { id }, req, res, apolloClient }) {
        setSearch({ active: false })
        if (req && !id) {
            createError({ code: 'NOT FOUND', message: 'User not found.' })
            res.writeHead(302, { Location: `/` })
            res.end()
            return {}
        }
        id = Number(id)
        const { data: { user } } = await apolloClient.query({ query: USER_PROFILE, variables: { id } })
        if (!user) {
            createError({ code: 'NOT FOUND', message: 'User not found.' })
            res.writeHead(302, { Location: `/` })
            res.end()
            return {}
        }
        return { user }
    }
    render() {
        return (
            <ProfilePage user={this.props.user} />
        );
    }
}

export default Profile;
