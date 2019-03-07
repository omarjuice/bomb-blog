import React, { Component } from 'react';
import moment from 'moment'
import DeleteReply from './DeleteReply';
import UpdateReply from './UpdateReply';
import LinkWrap from '../../../global/LinkWrap';
class Reply extends Component {
    state = {
        editing: false
    }
    render() {
        const { id, reply_text, replier, created_at, comment_id, last_updated } = this.props
        return (
            <article className="media">
                <figure className="media-left">
                    <p className="image is-48x48">
                        <img src={replier.profile.photo_path || '/static/user_image.png'} />
                    </p>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <LinkWrap profile={replier} >
                            <a>
                                <span>
                                    {replier.isMe ? <em>You</em> : <strong>{replier.username}</strong>}
                                    {replier.id === this.props.commenter ? <span className="icon has-text-dark"><i className="fas fa-comment-alt"></i></span> : ''}
                                    {replier.id === this.props.author ? <span className="icon has-text-dark"><i className="fas fa-pen-nib"></i></span> : ''}
                                </span>
                            </a>
                        </LinkWrap>
                        <br />
                        {!this.state.editing ? reply_text : <UpdateReply commentId={comment_id} replyId={id} initial={reply_text} stopEdit={() => this.setState({ editing: false })} />}
                        <br />
                        <small>
                            {moment.utc(Number(created_at)).local().fromNow()}
                            {replier.isMe ? <> · <a onClick={() => this.setState({ editing: !this.state.editing })}
                                className={`${this.state.editing ? 'has-text-danger' : ''} has-text-weight-bold`}>
                                {this.state.editing ? 'CANCEL' : 'EDIT'}</a> </> : ''}
                        </small>
                    </div>
                </div>
                {replier.isMe ? <DeleteReply postId={this.props.postId} commentId={comment_id} replyId={id} /> : ''}
            </article>
        );
    }
}

export default Reply;
