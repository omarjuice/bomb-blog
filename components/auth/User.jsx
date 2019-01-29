import React, { Component } from 'react';
import Link from 'next/link'
import { Query } from 'react-apollo';
import Loading from '../meta/Loading';
import { CURRENT_USER } from '../../apollo/queries';
import { clearError } from '../../apollo/clientWrites';



class User extends Component {
    render() {
        return (
            <Query query={CURRENT_USER}>
                {({ loading, error, data }) => {
                    if (loading) return <Loading />;
                    if (error) clearError();
                    return (
                        <div>
                            <Link href={{ pathname: '/profile', query: { id: data.user.id } }}>
                                <a id="greeting" className="has-text-light ">
                                    <p><em>Hey there, </em><strong>{data.user.username}</strong>!</p>
                                </a>

                            </Link>
                            <style jsx>{`
                                p{
                                    margin-right: 10px;
                                }
                                a{
                                    text-decoration: underline
                                }
                                `}</style>
                        </div>
                    )
                }}
            </Query>
        );
    }
}

export default User;
