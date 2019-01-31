import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import { CREATE_REPLY } from '../../apollo/mutations';
import { AUTHENTICATED } from '../../apollo/queries';
import UserPhoto from '../auth/UserPhoto';
import Loading from '../meta/Loading';

class CreateReply extends Component {
    state = {
        input: ''
    }
    onSubmit = createReply => {
        return async e => {
            e.preventDefault()
            await createReply({ variables: { comment_id: this.props.commentId, reply_text: this.state.input } })
            this.setState({
                input: ''
            })
        }
    }
    render() {
        return (
            <Query query={AUTHENTICATED}>
                {({ loading, error, data }) => {
                    if (loading || error || !data.authenticated) {
                        return (
                            <article className="media">
                                <figure className="media-left">
                                    <i class="fas fa-reply fa-3x"></i>
                                </figure>
                                <div className="media-content">
                                    <div className="content is-size-5">
                                        Log in to reply.
                                    </div>
                                </div>
                            </article>
                        )
                    }

                    return (
                        <Mutation mutation={CREATE_REPLY} refetchQueries={[`Replies`, `Comments`]}>
                            {(createReply, { loading, error, data }) => {
                                return <article className="media">
                                    <figure className="media-left">
                                        <p className="image is-48x48">
                                            <UserPhoto />
                                        </p>
                                    </figure>
                                    <div className="media-content">
                                        <form action="" className="form" onSubmit={!loading && !error ? this.onSubmit(createReply) : undefined}>
                                            <div className="field">
                                                <p className="control">
                                                    <textarea onChange={e => this.setState({ input: e.target.value })} value={this.state.input} className="textarea" rows="2" placeholder="Add a reply..."></textarea>
                                                </p>
                                            </div>
                                            <div className="field">
                                                <p className="control">
                                                    <button type="submit" className={`button is-info is-outlined ${loading && 'is-loading'}`}>Reply</button>
                                                </p>
                                            </div>
                                        </form>
                                    </div>
                                </article>
                            }}
                        </Mutation>
                    )
                }}
            </Query>
        );
    }
}

export default CreateReply;
