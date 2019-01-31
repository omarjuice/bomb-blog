import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { COMMENTS } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import moment from 'moment'
import Link from 'next/link';

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
                                    let i = 0;

                                    return <article key={id} className="media">
                                        <figure className="media-left">
                                            <p className="image is-64x64">
                                                <img src={commenter.profile.photo_path || "/static/user_image.png"} />
                                            </p>
                                        </figure>
                                        <div className="media-content">
                                            <div className="content">
                                                <p>
                                                    <Link href={{ pathname: '/profile', query: { id: commenter.id } }} >
                                                        <a>
                                                            {commenter.isMe ? <em>You</em> : <strong>{commenter.username}</strong>}
                                                        </a>
                                                    </Link>
                                                    <br />
                                                    {comment_text}
                                                    <br />
                                                    {
                                                        (tags.map((tag, i) => {
                                                            return <a key={tag.id} className={`tag is-rounded is-small font-2 is-medium ${i % 2 === 1 ? 'is-info' : 'is-primary'}`}>{tag.tag_name}</a>
                                                        }))
                                                    }

                                                    <br />
                                                    <small><a>Like</a> · <a>Reply</a> · {moment.utc(Number(created_at)).local().fromNow(true)}</small> ·
                                                    <span className="icon has-text-primary"><i className={`${iLike ? 'fas' : 'far'} fa-heart`}></i></span><span className="has-text-primary">{numLikes}</span> ·
                                                    <span className="icon has-text-info"><i class="fas fa-reply"></i></span><span className="has-text-info">{numReplies}</span>


                                                </p>
                                            </div>

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
