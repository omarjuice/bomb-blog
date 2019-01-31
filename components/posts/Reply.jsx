import React, { Component } from 'react';
import Link from 'next/link'
import moment from 'moment'
class Reply extends Component {
    render() {
        const { id, reply_text, replier, created_at, last_updated } = this.props
        return (
            <article className="media">
                <figure className="media-left">
                    <p className="image is-48x48">
                        <img src={replier.profile.photo_path || '/static/user_image.png'} />
                    </p>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <p>
                            <Link href={{ pathname: '/profile', query: { id: replier.id } }} >
                                <a>
                                    {replier.isMe ? <em>You</em> : <strong>{replier.username}</strong>}
                                </a>
                            </Link>
                            <br />
                            {reply_text}
                            <br />
                            <small>{moment.utc(Number(created_at)).local().fromNow(true)}</small>
                        </p>
                    </div>
                </div>
            </article>
        );
    }
}

export default Reply;
