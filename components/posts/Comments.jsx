import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { COMMENTS } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';

// comments{
//     id
//     commenter{
//         id
//         username
//         profile{
//             photo_path
//         }
//     }
//     created_at
//     last_updated
//     comment_text
//     numLikes
//     tags{
//         id
//         tag_name
//     }
//     iLike
//     numReplies
// }

class Comments extends Component {
    render() {
        return (
            <div>
                <Query query={COMMENTS} variables={{ id: this.props.id }}>
                    {({ loading, error, data }) => {
                        if (loading) return <Loading size="5x" color="primary" style="margin-top: 5rem" />
                        if (error) return <ErrorIcon size="5x" color="primary" style="margin-top: 5rem" />
                        return (<div>
                            {
                                data.post.comments.map((comment) => {
                                    const { id, commenter, created_at, last_updated, comment_text, numLikes, tags, iLike, numReplies } = comment
                                    return <article key={id} className="media">
                                        <figure className="media-left">
                                            <p className="image is-64x64">
                                                <img src={commenter.profile.photo_path || "/static/user_image.png"} />
                                            </p>
                                        </figure>
                                        <div className="media-content">
                                            <div className="content">
                                                <p>
                                                    <strong>{commenter.username}</strong>
                                                    <br />
                                                    {comment_text}
                                                    <br />
                                                    <small><a>Like</a> · <a>Reply</a> · 3 hrs</small> · <span className="icon has-text-primary"><i className={`${iLike ? 'fas' : 'far'} fa-heart`}></i></span><span className="has-text-primary">{numLikes}</span>
                                                </p>
                                            </div>

                                            {/* <article className="media">
                                        <figure className="media-left">
                                            <p className="image is-48x48">
                                                <img src="https://bulma.io/images/placeholders/96x96.png" />
                                            </p>
                                        </figure>
                                        <div className="media-content">
                                            <div className="content">
                                                <p>
                                                    <strong>Sean Brown</strong>
                                                    <br />
                                                    Donec sollicitudin urna eget eros malesuada sagittis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam blandit nisl a nulla sagittis, a lobortis leo feugiat.
                                                    <br />
                                                    <small><a>Like</a> · <a>Reply</a> · 2 hrs</small>
                                                </p>
                                            </div>


                                        </div>
                                    </article> */}

                                            {/* <article className="media">
                                        <figure className="media-left">
                                            <p className="image is-48x48">
                                                <img src="https://bulma.io/images/placeholders/96x96.png" />
                                            </p>
                                        </figure>
                                        <div className="media-content">
                                            <div className="content">
                                                <p>
                                                    <strong>Kayli Eunice </strong>
                                                    <br />
                                                    Sed convallis scelerisque mauris, non pulvinar nunc mattis vel. Maecenas varius felis sit amet magna vestibulum euismod malesuada cursus libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Phasellus lacinia non nisl id feugiat.
                                                    <br />
                                                    <small><a>Like</a> · <a>Reply</a> · 2 hrs</small>
                                                </p>
                                            </div>
                                        </div>
                                    </article> */}
                                        </div>
                                    </article>
                                })
                            }

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
