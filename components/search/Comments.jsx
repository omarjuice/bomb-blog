import React, { Component } from 'react';
import Link from 'next/link';
import moment from 'moment'
import BomgSVG from '../svg/bomb';
import LikeComment from '../posts/comments/LikeComment';
import UnlikeComment from '../posts/comments/UnlikeComment';
import { showModal } from '../../apollo/clientWrites';
import { shortenNumber } from '../../utils';

class SearchComments extends Component {
    render() {
        const { data } = this.props
        return (
            <>
                {data.results.map(comment => {
                    const { id, post_id, commenter, created_at, last_updated, comment_text, numLikes, tags, iLike, numReplies, post } = comment
                    return <article key={id}
                        className="media">
                        <figure className="media-left">
                            <p className="image is-64x64">
                                <img src={commenter.profile.photo_path || "/static/user_image.png"} />
                            </p>
                        </figure>
                        <div className="media-content">
                            <div className="content">
                                {<div>
                                    <Link href={{ pathname: '/profile', query: { id: commenter.id } }} >
                                        <a>
                                            {commenter.isMe ? <em>You</em> : <strong>{commenter.username}</strong>}
                                        </a>
                                    </Link>
                                    <br />
                                    <span className="icon"><i className="fas fa-long-arrow-alt-right"></i></span> <Link href={{ pathname: '/posts', query: { id: post.id } }} >
                                        <a className="font-2">
                                            {post.title}
                                        </a>
                                    </Link>
                                    <br />
                                    {comment_text}

                                    <br />
                                    {tags.map((tag, i) => (
                                        <span key={tag.id} className={`tag font-2 ${i % 2 === 0 ? 'is-primary' : 'is-info'}`}>{tag.tag_name}</span>
                                    ))}



                                    <br />
                                    <small>{iLike ? <UnlikeComment commentId={id} postId={post_id} /> : <LikeComment commentId={id} postId={post_id} />} · {last_updated ? <i className="fas fa-pen-square"></i> : ''} {moment.utc(Number(last_updated || created_at)).local().fromNow(true)}</small> ·
                                <a onClick={() => showModal({ display: 'Likers', message: 'Users who like this', active: true, info: { type: 'comment', id } })} className="has-text-primary"><span className="icon">{iLike ? <BomgSVG lit={true} scale={1.2} /> : <BomgSVG lit={false} scale={1.2} />}</span><span className="has-text-primary">{shortenNumber(numLikes)}</span></a> ·
                                        <span className="icon has-text-info"><i className="fas fa-reply"></i></span>
                                    <span className="has-text-info">{shortenNumber(numReplies)}</span>
                                </div>}
                            </div>
                        </div>

                    </article>
                })}
                {this.props.end ? <article className="media">
                    <figure className="media-left">
                        <div className="image is-64x64">
                            <BomgSVG lit={false} face={{ happy: false }} />
                        </div>
                    </figure>
                    <div className="media-content font-2 has-text-centered">
                        <div className="content has-text-centered">
                            <h3 className="subtitile is-3">
                                No Comments to show...
                        </h3>

                        </div>
                    </div>
                </article> : ''}
            </>
        );
    }
}

export default SearchComments;
