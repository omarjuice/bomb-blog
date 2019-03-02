import React, { Component } from 'react';
import moment from 'moment'
import FeaturePost from '../admin/FeaturePost';
import { shortenNumber, getMatches } from '../../utils';
import { setSearch, renderModal } from '../../apollo/clientWrites';
import LinkWrap from '../global/LinkWrap';
class Featured extends Component {
    shorten = (text, maxLen = 100) => {
        if (text.length > maxLen) {
            return text.split(' ').reduce((acc, word) => {
                if (acc.totalLen < maxLen) {
                    acc.totalLen += word.length
                    acc.text += word + ' '
                }
                return acc
            }, { totalLen: 0, text: '' }).text + '...'
        }
        return text
    }
    genMedia = (post = 'large') => {
        return (
            <article className="media author">
                <div className="media-content">
                    <div className="content">
                        <p>
                            <LinkWrap profile={post.author}>
                                <a >
                                    <i>
                                        {post.author.username}
                                    </i>
                                </a>
                            </LinkWrap>
                            <br />
                            <small>{moment.utc(Number(post.created_at)).local().fromNow()}</small>
                            <br />
                            <small>{Math.ceil(getMatches(post.post_content, /\w+/g).length / 200)} min read</small>
                        </p>
                    </div>
                </div>
            </article>
        )
    }
    genTags = (post) => {
        return (
            <>
                {post.tags.slice(0, 10).map((tag, i) => (
                    <a onClick={() => setSearch({ addToInput: ` #${tag.tag_name}`, active: true })} key={tag.id} className={`tag font-1 ${i % 2 === 0 ? 'is-primary' : 'is-dark'}`}>{tag.tag_name}</a>
                ))}
                {post.tags.length > 10 ? <div className="tag">...</div> : ''}
            </>
        )
    }
    genStats = (post, size = 'large') => {
        return (
            <div className="columns is-mobile is-multiline stats">
                <div className="column is-narrow is-paddingless">
                    <a onClick={() => renderModal({ active: true, display: 'Likers', info: { type: 'post', id: post.id } })} className="has-text-weight-bold has-text-primary"><span className={`icon ${size === 'large' ? 'is-large' : ''}`}><i className={`fas fa-bomb ${size === 'large' ? 'fa-2x' : ''}`}></i></span><span className="stat-num">{shortenNumber(post.numLikes)}</span></a>
                </div>
                <div className="column is-narrow is-paddingless">
                    <p className="has-text-weight-bold has-text-grey"><span className={`icon ${size === 'large' ? 'is-large' : ''}`}><i className={`fas fa-comment ${size === 'large' ? 'fa-2x' : ''}`}></i></span><span className="stat-num">{shortenNumber(post.numComments)}</span></p>
                    <FeaturePost featured={post.featured} id={post.id} />
                </div>
            </div>
        )
    }
    genHead = (post, column = false) => {
        return (
            <LinkWrap post={post} >
                <a className={column ? 'column is-full' : null}>
                    <div>
                        <p className="title is-4 font-1">{this.shorten(post.title)}</p>
                        <p className="subtitle is-6">{this.shorten(post.caption, 200)}</p>
                    </div>
                </a>
            </LinkWrap>
        )
    }
    render() {
        const { posts } = this.props
        return (<div>
            <div className={` ${this.props.active ? '' : 'is-hidden-mobile'}`}>
                <div className="tile is-ancestor">
                    <div className="tile is-parent is-3">
                        {posts[0] ? <article className="tile is-child">
                            <div className="media-center">
                                <img src={posts[0].author.profile.photo_path || `/static/user_image.png`} className="author-image" alt={`${posts[0].author.username}'s picture`} />
                            </div>
                            {this.genHead(posts[0])}
                            <br />
                            <div className="columns is-multiline is-mobile">
                                <div className="column is-half-mobile is-full-tablet">
                                    {posts[0].image ? <LinkWrap post={posts[0]}>
                                        <a >
                                            <figure className="image is-4by3">
                                                <img src={posts[0].image} alt="image" />
                                            </figure>
                                        </a>
                                    </LinkWrap> : ''}

                                </div>
                                <div className="column is-half-mobile is-full-tablet">
                                    <div className="columns is-mobile is-multiline">
                                        <div className="column is-full-mobile is-half-tablet">
                                            {this.genStats(posts[0])}
                                        </div>
                                        <div className="column is-full-mobile is-half-tablet">
                                            {this.genMedia(posts[0])}
                                        </div>
                                    </div>
                                </div>
                                <div className="column is-full">
                                    {this.genTags(posts[0])}
                                </div>
                            </div>
                        </article> : ''}
                    </div>
                    <div className="tile is-vertical">
                        <div className="tile is-parent">
                            {posts[1] ? <article className="tile is-child">
                                <div className="media-center">
                                    <img src={posts[1].author.profile.photo_path || `/static/user_image.png`} className="author-image" alt={`${posts[0].author.username}'s picture`} />
                                </div>
                                <div className="columns is-multiline is-mobile">
                                    <div className="column is-three-quarters-desktop is-full-mobile">
                                        {this.genHead(posts[1])}
                                        <br />
                                        <div className="columns is-mobile is-multiline">
                                            {posts[1].image ? <div className="column is-half-mobile is-hidden-tablet">
                                                <LinkWrap post={posts[1]}>
                                                    <a>
                                                        <figure className="image is-4by3">
                                                            <img src={posts[1].image} alt="image" />
                                                        </figure>
                                                    </a>
                                                </LinkWrap>
                                            </div> : ''}
                                            <div className="column is-7-desktop is-half-mobile">
                                                <div className="columns is-mobile is-multiline">
                                                    <div className="column is-full">
                                                        {this.genStats(posts[1])}
                                                    </div>
                                                    <div className="column is-full">
                                                        {this.genMedia(posts[1])}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="column is-5-desktop is-full-tablet is-full-mobile">
                                                {this.genTags(posts[1])}
                                            </div>

                                        </div>
                                    </div>
                                    {posts[1].image ? <div className="column is-one-quarter is-hidden-mobile">
                                        <LinkWrap post={posts[1]}>
                                            <a >
                                                <figure className="image is-4by3">
                                                    <img src={posts[1].image} alt="image" />
                                                </figure>
                                            </a>
                                        </LinkWrap>
                                    </div> : ''}
                                </div>
                            </article> : ''}
                        </div>
                        <div className="tile">

                            <div className="tile is-parent">
                                {posts[2] ? <article className="tile is-child">
                                    <div className="media-center">
                                        <img src={posts[2].author.profile.photo_path || `/static/user_image.png`} className="author-image" alt={`${posts[0].author.username}'s picture`} />
                                    </div>
                                    <div className="columns is-multiline is-mobile">
                                        {this.genHead(posts[2], true)}
                                        {posts[2].image ? <LinkWrap post={posts[2]}>
                                            <a className="column is-half">
                                                <figure className="image is-4by3">
                                                    <img src={posts[2].image} alt="image" />
                                                </figure>
                                            </a>
                                        </LinkWrap> : ''}
                                        <div className="column is-half">
                                            {this.genStats(posts[2])}
                                            {this.genMedia(posts[2])}
                                        </div>

                                        <div className="column is-full">
                                            {this.genTags(posts[2])}
                                        </div>

                                    </div>

                                </article> : ''}
                            </div>
                            <div className="tile is-parent">
                                {posts[3] ? <article className="tile is-child">
                                    <div className="media-center">
                                        <img src={posts[3].author.profile.photo_path || `/static/user_image.png`} className="author-image" alt={`${posts[0].author.username}'s picture`} />
                                    </div>
                                    <div className="columns is-multiline is-mobile">
                                        {this.genHead(posts[3], true)}
                                        {posts[3].image ? <LinkWrap post={posts[3]}>
                                            <a className="column is-half">
                                                <figure className="image is-4by3">
                                                    <img src={posts[3].image} alt="image" />
                                                </figure>
                                            </a>
                                        </LinkWrap> : ''}
                                        <div className="column is-half">
                                            {this.genStats(posts[3])}
                                            {this.genMedia(posts[3])}
                                        </div>
                                        <div className="column is-full">
                                            {this.genTags(posts[3])}
                                        </div>
                                    </div>

                                </article> : ''}
                            </div>
                        </div>
                    </div>
                    {posts[4] ? <div className="tile is-parent is-3">
                        <article className="tile is-child">
                            <div className="media-center">
                                <img src={posts[4].author.profile.photo_path || `/static/user_image.png`} className="author-image" alt={`${posts[4].author.username}'s picture`} />
                            </div>
                            {this.genHead(posts[4])}
                            <br />
                            <div className="columns is-multiline is-mobile">
                                <div className="column is-half-mobile is-full-tablet">
                                    {posts[4].image ? <LinkWrap post={posts[4]} >
                                        <a >
                                            <figure className="image is-4by3">
                                                <img src={posts[4].image} alt="image" />
                                            </figure>
                                        </a>
                                    </LinkWrap> : ''}

                                </div>
                                <div className="column is-half-mobile is-full-tablet">
                                    <div className="columns is-mobile is-multiline">
                                        <div className="column is-full-mobile is-half-tablet">
                                            {this.genStats(posts[4])}
                                        </div>
                                        <div className="column is-full-mobile is-half-tablet">
                                            {this.genMedia(posts[4])}
                                        </div>
                                    </div>
                                </div>
                                <div className="column is-full">
                                    {this.genTags(posts[4])}
                                </div>
                            </div>
                        </article>
                    </div> : ''}

                </div>

            </div>
            <style jsx>{`
                .tile.is-ancestor{
                    margin-top: 2rem;
                }
                .author-image {
                        position: relative;
                        top: -30px;
                        left: 50%;
                        width: 60px;
                        height: 60px;
                        margin-left: -30px;
                        border: 3px solid #ccc;
                        border-radius: 50%;
                        box-shadow: 0px 1px 1px gray;
                        z-index: 3;
                    }

                .title{
                    margin-top: -2rem;
                    hyphens: auto
                }
                .media .media-content .content{
                    word-break: break-all
                }
                .subtitle{
                    margin: 1rem auto
                }
                article.tile{
                    padding: 1rem;
                    background-color: #F9F9F9;
                    border-radius: 1rem;
                    box-shadow: 0px 0px 1px gray
                }
                @media only screen and (min-width: 768px ){
                    .tile.is-ancestor{
                        padding: 1rem;
                    }
                }
                `}</style>
        </div>

        );
    }
}

export default Featured;
