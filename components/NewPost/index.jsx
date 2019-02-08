import React, { Component } from 'react';
import marked from 'marked'
import { setSearch } from '../../apollo/clientWrites';
import Like from '../global/Like';
import { getMatches } from '../../utils/index';
import Follow from '../global/Follow';
import BombSVG from '../svg/bomb';
const renderer = new marked.Renderer()
marked.setOptions({
    breaks: true,
    sanitize: true
});
class NewPost extends Component {
    state = {
        preview: false,
        title: 'Title of post',
        caption: 'I am the bomb',
        tags: '#tag1 #tag2',
        body: '# post-body'
    }
    getTags = () => {
        const tagRegex = /#(\w+)/g
        return getMatches(this.state.tags, tagRegex)
    }
    render() {
        return (

            // <div className="markdown-body" dangerouslySetInnerHTML={{
            //     __html: marked.parse(`# Hangman (client)\n## A multiplayer chat app and hangman game.
            //     \nPlayers can play hangman and chat with anyone and anywhere.
            //     \nThis web app is mobile responsive. It uses the Oxford Dictionary and Urban Dictionary APIs.
            //     \n## User Experience

            //     \nAt the join page, a user can enter a username and a room they would like to enter. If a room of the chosen name does not exist, the user will be asked to choose a dictionary for that room. Then users will be taken to a room where they can chat, and if there are at least 2 players, play hangman.

            //     \n## GamePlay
            //      \nIn the Urban or Oxford Dictionary rooms, players can choose a word and the app will choose a hint for them. In the Free-For-All rooms, players make their own hints. The max number of players per room is capped at 5.

            //     \nPlayers get 60 seconds per turn and 5 incorrect guesses. For each correct letter, the player is awarded 1 point. Meaning partial credit even if the word is not complete. If the word is not completely guessed, the word-picker is awarded 5 points.
            //     \nThe players take turns choosing words, and word choosers do not partake in the game that they choose for.

            //     \n### Made with Socket.io, Node, React, Redux, and AnimeJS.

            //     \n[Server code](https://github.com/OmarJuice/Hangman-server)`, { renderer })
            // }}>

            // </div>
            <div>
                <div className="columns is-centered is-multiline">
                    <div className={`column is-5-desktop is-10-tablet is-full-mobile has-text-centered ${this.state.preview ? 'is-hidden-touch' : ''}`}>
                        <h1 className="title">New Post</h1>
                        <form action="" className="form">
                            <div className="field has-text-centered">
                                <label className="label">Title</label>
                                <div className="control">
                                    <input onChange={e => this.setState({ title: e.target.value })} value={this.state.title} className="input" type="text" placeholder="Title" />
                                </div>
                            </div>
                            <div className="field has-text-centered">
                                <label className="label">Caption</label>
                                <div className="control">
                                    <input onChange={e => this.setState({ caption: e.target.value })} value={this.state.caption} className="input" type="text" placeholder="Caption" />
                                </div>
                            </div>
                            <div className="field has-text-centered">
                                <label className="label">Tags</label>
                                <div className="control">
                                    <input onChange={e => this.setState({ tags: e.target.value })} value={this.state.tags} className="input" type="text" placeholder="#tags" />
                                </div>
                            </div>
                            <div className="field has-text-centered">
                                <label className="label">BODY</label>
                                <div className="control">
                                    <textarea onChange={(e) => this.setState({ body: e.target.value })} value={this.state.body} className="textarea" type="text" placeholder="Post text goes here" />
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="buttons has-text-centered is-hidden-desktop">
                        <button onClick={() => this.setState({ preview: !this.state.preview })} className="button is-large is-primary is-rounded font-2"> <span className="icon"><i className="far fa-eye"></i></span> </button>
                    </div>
                    <div className={`column is-5-desktop is-10-tablet is-full-mobile ${this.state.preview ? '' : 'is-hidden-touch'}`}>
                        <div className="card article">
                            <div className="card-content">
                                <div className="media">
                                    <div className="media-center">
                                        <img src={`/static/user_image.png`} className="author-image" />
                                    </div>
                                    <div className="media-content has-text-centered">
                                        <p className="title is-1 article-title font-2">{this.state.title}</p>
                                        <div className="caption content is-size-3">
                                            <div className="columns is-mobile is-centered">
                                                <div className="column is-1"><i className="fas fa-quote-left fa-pull-left"></i></div>
                                                <div className="column is-9">{this.state.caption}</div>
                                                <div className="column is-1"><i className="fas fa-quote-right fa-pull-left"></i></div>
                                            </div>

                                        </div>
                                        <hr />
                                        <div className="columns is-mobile is-centered is-multiline">
                                            <div className="column is-2 is-1-mobile"></div>
                                            <div className="column is-2 has-text-centered">
                                                <div>
                                                    <>
                                                        <a className="has-text-primary has-text-centered">
                                                            <span className="icon is-large">
                                                                <BombSVG lit={true} scale={this.props.scale || 1.2} />
                                                            </span>
                                                        </a>
                                                        <br />
                                                        <a className="is-size-4 font-1 has-text-dark underline">0</a>
                                                    </>
                                                </div>
                                            </div>
                                            <div className="column is-2 is-hidden-tablet"></div>
                                            <div className="post-stats column is-6 has-text-centered">
                                                <div className="subtitle is-6 article-subtitle has-text-centered">
                                                    <a>@{'username'}</a>
                                                    <br />
                                                    at {'12:37pm on December 11th, 2018'}
                                                    <br />
                                                    {<Follow />}
                                                </div>
                                            </div>
                                            <div className="column is-8-desktop is-8-tablet is-full-mobile">
                                                {<div className="tags">
                                                    {this.getTags().map((tag, i) => {
                                                        return <a key={tag} className={`tag is-rounded font-2 is-medium ${i % 2 === 1 ? 'is-primary' : 'is-info'}`}>{tag}</a>
                                                    })}
                                                </div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div dangerouslySetInnerHTML={{ __html: marked.parse(this.state.body) }} className="content article-body markdown-body">

                                </div>
                            </div>
                        </div>

                    </div>


                </div>

                <style jsx>{`
                    .textarea{
                        height: 50vh
                    }
                    .buttons{
                       position: fixed;
                        bottom: 1rem; 
                        right: 2rem
                    }
                    .author-image {
                        position: absolute;
                        top: -30px;
                        left: 50%;
                        width: 60px;
                        height: 60px;
                        margin-left: -30px;
                        border: 3px solid #ccc;
                        border-radius: 50%;
                        box-shadow: 0px 1px 1px gray
                    }
                    .media-center {
                        display: block;
                        margin-bottom: 1rem;
                    }
                    .media-content {
                        margin-top: 3rem;
                        overflow: visible
                    }
                    .article {
                        margin-top: 3rem;
                    }
                    .article-subtitle {
                        color: #909AA0;
                        margin-bottom: 3rem;
                    }
                    .article-body {
                        line-height: 1.4;
                    }
                    .load-error{
                        margin-top: 40vh
                    }
                    .post-stats{
                        display: flex;
                        align-items: center;
                    }
                    `}</style>
            </div>

        );
    }
}

export default NewPost;
