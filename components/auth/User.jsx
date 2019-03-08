import React, { Component } from 'react';
import { Query } from 'react-apollo';
import Loading from '../meta/Loading';
import ErrorMessage from '../meta/ErrorMessage';
import { CURRENT_USER } from '../../apollo/queries';
import { clearError } from '../../apollo/clientWrites';
import LinkWrap from '../global/LinkWrap';



class User extends Component {
    render() {
        return (
            <Query query={CURRENT_USER} ssr={false}>
                {({ loading, error, data }) => {
                    if (loading || !data.user) return <Loading />;
                    if (error) {
                        clearError();
                        return <ErrorMessage />
                    };
                    if (data.user) return (
                        <>
                            <div>
                                <img src={data.user.profile.photo_path || '/static/user_image.png'} alt="" />
                            </div>
                            <div className="has-text-centered">
                                <LinkWrap profile={data.user}>
                                    <a onClick={this.props.deactivateMenu} id="greeting" className="has-text-light font-1 has-text-centered">
                                        <p><strong>{(loading && <Loading style="margin" size="2x" />) || data.user.username}</strong></p>
                                    </a>
                                </LinkWrap>
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
                                };

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
