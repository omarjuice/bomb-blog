import React, { Component } from 'react';
import Link from 'next/link';
import UnlikePost from '../posts/UnlikePost';
import LikePost from '../posts/LikePost';
import moment from 'moment'
import BombSVG from '../svg/bomb';
import { shortenNumber } from '../../utils';
import { renderModal, setSearch } from '../../apollo/clientWrites';

class Recent extends Component {
    render() {
        return (
            <div>
                <div className="tile is-vertical">
                    {this.props.results.map(({ id, title, author, created_at, last_updated, numLikes, numComments, caption, iLike, tags, image }, i) => {
                        const likes = shortenNumber(numLikes)
                        const comments = shortenNumber(numComments)
                        const likesMargin = String(likes.length * .25) + 'rem'
                        const commentsMargin = String(comments.length * .4) + 'rem'
                        const timeMargin = String(comments.length * .25) + 'rem'
                        return (
                            <article key={id} className="media has-text-centered">
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
                                            {tags.slice(0, 8).map((tag, i) => (
                                                <a onClick={() => setSearch({ addToInput: ` #${tag.tag_name}`, active: true })} key={tag.id} className={`tag font-2 ${i % 2 === 0 ? 'is-primary' : 'is-info'}`}>{tag.tag_name}</a>
                                            ))}{
                                                tags.length > 7 ? <div className="tag">...</div> : ''
                                            }
                                            <br />
                                            <small>
                                                <a onClick={() => renderModal({ display: 'Likers', message: 'Users who like this', active: true, info: { type: 'post', id } })}>
                                                    <span className="icon has-text-primary has-text-weight-bold"><i className="fas fa-bomb"></i>{likes} </span>
                                                </a>
                                                <a>
                                                    <span className="icon has-text-weight-bold has-text-info"><i className="fas fa-comments"></i> {comments}</span>
                                                </a>
                                                <time>{moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}</time>
                                            </small>
                                        </p>
                                    </div>
                                </div>
                                {/* <div className="media-right columns is-multiline is-mobile is-centered">
                                    <div className="column is-half has-text-centered">
                                        {iLike ? <UnlikePost size="2x" postId={id} /> : <LikePost size="2x" postId={id} />}
                                    </div>

                                </div> */}

                                <div className="media-right">
                                    <p className="image is-128x128">
                                        <img src={image} alt="image" />
                                    </p>
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
                        )
                    })}
                    {this.props.end ? <article className="media">
                        <figure className="media-left">
                            <div className="image is-64x64">
                                <BombSVG lit={false} face={{ happy: false }} />
                            </div>
                        </figure>
                        <div className="media-content font-2 has-text-centered">
                            <div className="content has-text-centered">
                                <h3 className="subtitile is-3">
                                    No {data.results.length > 0 ? 'more' : ''} Posts to show...
                        </h3>

                            </div>
                        </div>
                    </article> : ''}
                </div>
            </div>
        );
    }
}

export default Recent;
