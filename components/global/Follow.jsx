import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import { FOLLOW } from '../../apollo/mutations';
import ErrorIcon from '../meta/ErrorIcon';




class Follow extends Component {

    render() {
        const { userId } = this.props
        const size = this.props.size === 'large' ? 'fa-3x' : 'fa-lg'
        return <Mutation mutation={FOLLOW} refetchQueries={[`Followers`, `Following`, `UserProfile`]} variables={{ user_id: userId }}>
            {(createFollow, { error, loading, data }) => {
                if (loading) return <Loading size={size} color="link" />
                if (error) return <ErrorIcon size={size} color="link" />
                if (!data || (data && !data.createFollow)) return (
                    <a onClick={createFollow}>
                        <span className="icon hover-icon">
                            <i className={`fas ${size} fa-user-plus has-text-info`}></i>
                        </span>
                    </a>
                )
                if (data && data.createFollow) {
                    return <span className="icon has-text-success"><i className={`${size} fas fa-check`}></i></span>
                }
            }}
        </Mutation>
    }
}

export default Follow;
