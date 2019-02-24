import React, { Component } from 'react';
import { shortenNumber } from '../../utils';
import UnlikePost from '../posts/UnlikePost';
import LikePost from '../posts/LikePost';
import moment from 'moment'
import BombSVG from '../svg/bomb';
import { renderModal, setSearch } from '../../apollo/clientWrites';
import LinkWrap from '../global/LinkWrap';


class Posts extends Component {
    render() {
        const { data } = this.props

        return (
            <>
                {data.results.map(({ id, title, author, created_at, last_updated, numLikes, numComments, caption, iLike, tags, image }, i) => {
                    const likes = shortenNumber(numLikes)
                    const comments = shortenNumber(numComments)
                    const likesMargin = String(likes.length * .25) + 'rem'
                    const commentsMargin = String(comments.length * .4) + 'rem'
                    const timeMargin = String(comments.length * .25) + 'rem'
                    return (
                        <article key={id} className="media has-text-centered">
                            <figure className="media-left">
                                <p className="image is-48x48">
                                    <span>{i + 1}</span>
                                    <img src={author.profile.photo_path || "/static/user_image.png"} />
                                </p>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <LinkWrap post={{ id, title }}><a><strong className="font-1">{title} </strong></a></LinkWrap>
                                        <br />
                                        {caption}
                                        <br />
                                        <LinkWrap profile={author} >
                                            <a>
                                                {author.isMe ? <strong>You</strong> : <em>{author.username}</em>}
                                            </a>
                                        </LinkWrap>
                                        <br />
                                        {tags.map((tag, i) => (
                                            <a onClick={() => setSearch({ addToInput: ` #${tag.tag_name}`, active: true })} key={tag.id} className={`tag font-1 ${this.props.inputTags.includes(tag.tag_name) ? 'is-primary' : ''}`}>{tag.tag_name}</a>
                                        ))}
                                        <br />

                                        <nav className="level is-mobile">
                                            <div className="level-left">
                                                <a className="level-item  has-text-primary has-text-weight-bold" onClick={() => renderModal({ display: 'Likers', message: 'Users who like this', active: true, info: { type: 'post', id } })}>
                                                    <span className="icon"><i className="fas fa-bomb"></i> </span>
                                                    {likes}
                                                </a>
                                                <a className="level-item has-text-weight-bold has-text-grey">
                                                    <span className="icon "><i className="fas fa-comments"></i> </span>
                                                    {comments}
                                                </a>
                                                <span className="level-item">{moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}</span>
                                            </div>
                                        </nav>
                                    </p>
                                </div>
                            </div>
                            <div className="media-right columns is-multiline is-mobile is-centered">
                                <div className="column is-half has-text-centered">
                                    {iLike ? <UnlikePost size="2x" postId={id} /> : <LikePost size="2x" postId={id} />}
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
                    )
                })}
                {this.props.end ? <article className="media">
                    <figure className="media-left">
                        <div className="image is-64x64">
                            <BombSVG lit={false} face={{ happy: false }} />
                        </div>
                    </figure>
                    <div className="media-content font-1 has-text-centered">
                        <div className="content has-text-centered">
                            <h3 className="subtitile is-3">
                                No {data.results.length > 0 ? 'more' : ''} Posts to show...
                        </h3>

                        </div>
                    </div>
                </article> : ''}
            </>
        )
    }
}

export default Posts;
