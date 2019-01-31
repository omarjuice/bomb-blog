import React, { Component } from 'react';
import moment from 'moment'
import Link from 'next/link'
import Replies from './replies';
class Comment extends Component {
    state = {
        replies: false
    }
    // onMouseEnter = e => e.target.classList.add('has-text-dark')
    // onMouseLeave = e => e.target.classList.remove('has-text-dark')

    render() {
        const { id, commenter, created_at, last_updated, comment_text, numLikes, tags, iLike, numReplies } = this.props
        return <article key={id}
            className="media">
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
                        <small><a>Like</a> · {moment.utc(Number(created_at)).local().fromNow()}</small> ·
                        <a className="has-text-primary"><span className="icon"><i className={`${iLike ? 'fas' : 'far'} fa-heart`}></i></span><span className="has-text-primary">{numLikes}</span></a> ·
                        <a onClick={() => this.setState({ replies: !this.state.replies })}
                            className="has-text-info">
                            <span className="icon"><i className="fas fa-reply"></i></span>
                            <span>{numReplies}</span>
                        </a>

                    </p>
                </div>
                {this.state.replies ? <Replies commentId={id} /> : ''}
            </div>
            <style jsx>{`
                .button.is-gray{
                    width: 100%;
                    border: none;
                }
                `}</style>
        </article>
    }
}

export default Comment;
