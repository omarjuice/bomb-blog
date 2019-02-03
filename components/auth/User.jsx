import React, { Component } from 'react';
import Link from 'next/link'
import { Query } from 'react-apollo';
import Loading from '../meta/Loading';
import { CURRENT_USER } from '../../apollo/queries';
import { clearError } from '../../apollo/clientWrites';
import ErrorMessage from '../meta/ErrorMessage';



class User extends Component {
    render() {
        return (
            <Query query={CURRENT_USER}>
                {({ loading, error, data }) => {
                    if (loading) return <Loading />;
                    if (error) {
                        clearError();
                        return <ErrorMessage />
                    };
                    return (
                        <>
                            <div>
                                <img src={data.user.profile.photo_path || '/static/user_image.png'} alt="" />
                            </div>
                            <div className="has-text-centered">

                                <Link href={{ pathname: '/profile', query: { id: data.user.id } }}>

                                    <a id="greeting" className="has-text-light font-2 has-text-centered">
                                        <p><strong>{(loading && <Loading style="margin" size="2x" />) || data.user.username}</strong></p>
                                    </a>

                                </Link>
                                <style jsx>{`
                                p{
                                    margin-right: 10px;
                                }
                                a{
                                    text-decoration: underline
                                }
                                #greeting{
                                    position: relative;
                                    left: .5rem !important;
                                }
                                `}</style>
                            </div>
                        </>
                    )
                }}
            </Query>
        );
    }
}

export default User;
