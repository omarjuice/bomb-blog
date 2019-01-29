import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import { FOLLOW } from '../../apollo/mutations';




class Follow extends Component {

    render() {
        const { userId } = this.props
        const size = this.props.size === 'large' ? 'fa-3x' : 'fa-lg'
        return <Mutation mutation={FOLLOW} refetchQueries={[`Followers`, `Following`, `UserProfile`]} variables={{ user_id: userId }}>
            {(createFollow, { loading, data }) => {
                if (loading) return <Loading />
                if (!data || (data && !data.createFollow)) return (
                    <a onClick={createFollow}>
                        <span className="icon hover-icon">
                            <i className={`fas ${size} fa-user-plus has-text-link`}></i>
                        </span>
                    </a>
                )
                if (data && data.createFollow) {
                    return <Loading />
                }
            }}
        </Mutation>
    }
}

export default Follow;
