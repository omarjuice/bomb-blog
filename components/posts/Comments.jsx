import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { COMMENTS } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import Comment from './Comment';

class Comments extends Component {

    render() {
        return (
            <div>
                <Query query={COMMENTS} variables={{ id: this.props.id }}>
                    {({ loading, error, data }) => {
                        if (loading) return <Loading size="5x" color="primary" style="margin-top: 5rem" />
                        if (error) return <ErrorIcon size="5x" color="primary" style="margin-top: 5rem" />
                        return (<div>
                            {data.post.comments.map((comment) => <Comment key={comment.id} {...comment} />)}
                            <hr />
                        </div>
                        )
                    }}
                </Query>
                <article className="media">
                    <figure className="media-left">
                        <p className="image is-64x64">
                            <img src="https://bulma.io/images/placeholders/128x128.png" />
                        </p>
                    </figure>
                    <div className="media-content">
                        <div className="field">
                            <p className="control">
                                <textarea className="textarea" placeholder="Add a comment..."></textarea>
                            </p>
                        </div>
                        <div className="field">
                            <p className="control">
                                <button className="button">Post comment</button>
                            </p>
                        </div>
                    </div>
                </article>
            </div>
        );
    }
}

export default Comments;
