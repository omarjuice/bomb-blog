import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Loading from '../meta/Loading';
import ErrorMessage from '../meta/ErrorMessage';

const FOLLOW = gql`
    mutation CreateFollow($user_id: Int!){
        createFollow(user_id: $user_id)
    }
`

class Follow extends Component {

    render() {
        const { user_id } = this.props
        const size = this.props.size === 'large' ? 'fa-3x' : 'fa-lg'
        return <Mutation mutation={FOLLOW} refetchQueries={[`Followers`, `Following`, `User`]} variables={{ user_id }}>
            {(createFollow, { loading, error, data }) => {
                if (loading) return <Loading />
                if (error) return <ErrorMessage />
                if (!data || (data && !data.createFollow)) return (
                    <a onClick={createFollow}>
                        <span className="icon hover-icon">
                            <i className={`fas ${size} fa-user-plus has-text-link`}></i>
                        </span>
                    </a>
                )
                if (data && data.createFollow) {
                    return <p>Followed</p>
                }
            }}
        </Mutation>
    }
}

export default Follow;
