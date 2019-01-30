import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import { UNFOLLOW } from '../../apollo/mutations';
import ErrorIcon from '../meta/ErrorIcon';


class Unfollow extends Component {

    render() {
        const { userId } = this.props
        const size = this.props.size === 'large' ? 'fa-3x' : 'fa-lg'
        return <Mutation mutation={UNFOLLOW} refetchQueries={[`Followers`, `Following`, `UserProfile`]} variables={{ user_id: userId }}>
            {(deleteFollow, { loading, error, data }) => {
                if (loading) return <Loading size={size} color="primary" />
                if (error) return <ErrorIcon size={size} color="primary" />
                if (!data || (data && !data.deleteFollow)) return (
                    <a onClick={deleteFollow}>
                        <span className="icon hover-icon">
                            <i className={`fas ${size} fa-user-minus has-text-primary`}></i>
                        </span>
                    </a>
                )
                if (data && data.deleteFollow) {
                    return <Loading />
                }
            }}
        </Mutation>
    }
}

export default Unfollow;