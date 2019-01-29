import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import ErrorMessage from '../meta/ErrorMessage';
import { FOLLOW } from '../../apollo/mutations';




class Follow extends Component {

    render() {
        const { userId } = this.props
        const size = this.props.size === 'large' ? 'fa-3x' : 'fa-lg'
        return <Mutation mutation={FOLLOW} refetchQueries={[`Followers`, `Following`, `UserProfile`]} variables={{ user_id: userId }}>
            {(createFollow, { loading, error, data, client }) => {
                if (loading) return <Loading scale={.2} />
                if (error) return <ErrorMessage />;
                console.log(data)
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
