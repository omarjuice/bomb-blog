import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import ErrorMessage from '../meta/ErrorMessage';
import { UNFOLLOW } from '../../apollo/mutations';


class Unfollow extends Component {

    render() {
        const { user_id } = this.props
        const size = this.props.size === 'large' ? 'fa-3x' : 'fa-lg'
        return <Mutation mutation={UNFOLLOW} refetchQueries={[`Followers`, `Following`, `User`]} variables={{ user_id }}>
            {(deleteFollow, { loading, error, data }) => {
                if (loading) return <Loading />
                if (error) return <ErrorMessage />
                if (!data || (data && !data.deleteFollow)) return (
                    <a onClick={deleteFollow}>
                        <span className="icon hover-icon">
                            <i className={`fas ${size} fa-user-minus has-text-primary`}></i>
                        </span>
                    </a>
                )
                if (data && data.deleteFollow) {
                    return <p>Unfollowed</p>
                }
            }}
        </Mutation>
    }
}

export default Unfollow;