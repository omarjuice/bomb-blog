import React, { Component } from 'react'
import { Query } from 'react-apollo';
import { REPLIES } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import Reply from './Reply';


class Replies extends Component {
    render() {
        return (
            <Query query={REPLIES} variables={{ id: this.props.commentId }}>
                {({ loading, error, data }) => {
                    if (error || loading) return (
                        <article className="media">
                            <div className="media-content">
                                <div className="content has-text-centered">
                                    {loading && <Loading color="primary" size="2x" style="margin-top:5px" />}
                                    {error && <ErrorIcon color="primary" size="2x" style="margin-top:5px" />}
                                </div>
                            </div>
                        </article>
                    )
                    return (<div>
                        {data.comment.replies.map((reply) => {
                            return (
                                <Reply key={reply.id} {...reply} />
                            )
                        })}
                        <article className="media">
                            <figure className="media-left">
                                <p className="image is-48x48">
                                    <img src={undefined || "/static/user_image.png"} />
                                </p>
                            </figure>
                            <div className="media-content">
                                <div className="field">
                                    <p className="control">
                                        <textarea className="textarea" rows="2" placeholder="Add a reply..."></textarea>
                                    </p>
                                </div>
                                <div className="field">
                                    <p className="control">
                                        <button className="button">Reply</button>
                                    </p>
                                </div>
                            </div>
                        </article>
                    </div>
                    )
                }}
            </Query>

        );
    }
}

export default Replies;
