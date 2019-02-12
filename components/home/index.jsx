import React, { Component } from 'react';
import moment from 'moment'
import { setSearch, renderModal } from '../../apollo/clientWrites';
import { shortenNumber } from '../../utils';
import Link from 'next/link';
class Home extends Component {
    render() {
        return (
            <div>
                {this.props.data.recentPosts.results.map(({ id, title, author, created_at, last_updated, numLikes, numComments, caption, iLike, tags }, i) => {
                    const likes = shortenNumber(numLikes)
                    const comments = shortenNumber(numComments)
                    const likesMargin = String(likes.length * .25) + 'rem'
                    const commentsMargin = String(comments.length * .4) + 'rem'
                    const timeMargin = String(comments.length * .25) + 'rem';
                    return < article key={id} className="media has-text-centered" >
                        <figure className="media-left">
                            <p className="image is-48x48">
                                <span>{i + 1}</span>
                                <img src={author.profile.photo_path || "/static/user_image.png"} />
                            </p>
                        </figure>
                        <div className="media-content">
                            <div className="content">
                                <p>
                                    <Link href={{ pathname: '/posts', query: { id } }}><a><strong className="font-2">{title} </strong></a></Link>
                                    <br />
                                    {caption}
                                    <br />
                                    <Link href={{ pathname: '/profile', query: { id: author.id } }} >
                                        <a>
                                            {author.isMe ? <strong>You</strong> : <em>{author.username}</em>}
                                        </a>
                                    </Link>
                                    <br />
                                    {tags.map((tag, i) => (
                                        <a onClick={() => setSearch({ addToInput: ` #${tag.tag_name}`, active: true })} key={tag.id} className={`tag`}>{tag.tag_name}</a>
                                    ))}
                                    <br />
                                    <small>
                                        <a onClick={() => renderModal({ display: 'Likers', message: 'Users who like this', active: true, info: { type: 'post', id } })}>
                                            <span className="icon has-text-primary has-text-weight-bold"><i className="fas fa-heart"></i>{likes} </span>
                                        </a>
                                        <a>
                                            <span className="icon has-text-weight-bold has-text-info"><i className="fas fa-comments"></i> {comments}</span>
                                        </a>
                                        <time>{moment.utc(Number(last_updated || created_at)).local().fromNow(true)}</time>
                                    </small>
                                </p>
                            </div>
                        </div>


                        <style jsx>{`

                        small a:nth-of-type(1){
                            margin-left: ${likesMargin}
                        }
                        small a:nth-of-type(2){
                            margin-left: ${commentsMargin};
                            margin-right: ${timeMargin}
                        }

                        `}</style>
                    </article>
                })}
            </div>
        );
    }
}

export default Home;
