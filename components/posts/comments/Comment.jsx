import React, { Component } from 'react';
import moment from 'moment'
import Link from 'next/link'
import Replies from './replies';
import DeleteComment from './DeleteComment';
import UpdateComment from './UpdateComment';
import UnlikeComment from './UnlikeComment';
import LikeComment from './LikeComment';
import BombSVG from '../../svg/bomb';
import { renderModal, setSearch } from '../../../apollo/clientWrites';

class Comment extends Component {
    state = {
        replies: false,
        editing: false
    }

    render() {
        const { id, post_id, commenter, created_at, last_updated, comment_text, numLikes, tags, iLike, numReplies } = this.props
        return <article key={id}
            className="media">
            <figure className="media-left">
                <p className="image is-64x64">
                    <img src={commenter.profile.photo_path || "/static/user_image.png"} />
                </p>
            </figure>
            <div className="media-content">
                <div className="content">
                    {this.state.editing ? <UpdateComment postId={post_id} commentId={id} stopEdit={() => this.setState({ editing: false })} initialInput={comment_text} initialTags={tags.map(tag => tag.tag_name)} />
                        : <div>
                            <Link href={{ pathname: '/profile', query: { id: commenter.id } }} >
                                <a>
                                    {commenter.isMe ? <em>You</em> : <strong>{commenter.username}</strong>}
                                </a>
                            </Link>
                            <br />
                            {comment_text}
                            {tags.length > 0 ?
                                <>
                                    <br />
                                    {(tags.map((tag, i) => {
                                        return <a onClick={() => setSearch({ addToInput: ` #${tag.tag_name}`, active: true })} key={tag.id} className={`tag is-small font-2 ${i % 2 === 1 ? 'is-info' : 'is-primary'}`}>{tag.tag_name}</a>
                                    }))}
                                </> : ''
                            }

                            <br />
                            <small>{iLike ? <UnlikeComment commentId={id} postId={post_id} /> : <LikeComment commentId={id} postId={post_id} />} · {last_updated ? <i className="fas fa-pen-square"></i> : ''} {moment.utc(Number(last_updated || created_at)).local().fromNow(true)}</small> ·
                        <a onClick={() => renderModal({ display: 'Likers', message: 'Users who like this', active: true, info: { type: 'comment', id } })} className="has-text-primary"><span className="icon">{iLike ? <BombSVG lit={true} scale={1.2} /> : <BombSVG lit={false} scale={1.2} />}</span><span className="has-text-primary">{numLikes}</span></a> ·
                        <a onClick={() => this.setState({ replies: !this.state.replies })}
                                className="has-text-info">
                                <span className="icon"><i className="fas fa-reply"></i></span>
                                <span>{numReplies}</span>
                            </a>
                            {commenter.isMe ? <> · <a onClick={() => this.setState({ editing: !this.state.editing })}
                                className={`${this.state.editing ? 'has-text-danger' : ''} has-text-weight-bold`}>
                                {this.state.editing ? 'CANCEL' : 'EDIT'}</a> </> : ''}

                        </div>}
                </div>
                {this.state.replies ? <Replies commentId={id} /> : ''}
            </div>
            {commenter.isMe ? <DeleteComment postId={post_id} commentId={id} /> : ''}
            <style jsx>{`
                .button.is-info{
                    width: 100%;
                    border: none;
                }
                `}</style>
        </article>
    }
}

export default Comment;
