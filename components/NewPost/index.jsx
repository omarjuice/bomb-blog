import React, { Component } from 'react';
import marked from 'marked'
import { getMatches } from '../../utils/index';
import Follow from '../global/Follow';
import BombSVG from '../svg/bomb';
marked.setOptions({
    breaks: true,
    sanitize: true
});
class NewPost extends Component {
    state = {
        head: true,
        preview: false,
        title: 'Title of post',
        caption: 'I am the bomb',
        tags: '#tag1 #tag2',
        body: '# post-body',
        buttonActions: []
    }
    getTags = () => {
        const tagRegex = /#(\w{1,30})/g
        return getMatches(this.state.tags, tagRegex)
    }
    componentDidMount() {
        this.markdown = document.querySelector('.markdown-body')
        this.textarea = document.querySelector('.textarea')
    }
    modifyText = (button) => {
        return e => {
            e.preventDefault()
            const { selectionStart, selectionEnd } = this.textarea
            let newSelectionStart = selectionStart;
            let newSelectionEnd = selectionStart
            this.textarea.focus()
            let stringToAdd = ''
            switch (button) {
                case 'header':
                    const { value } = e.target
                    if (!value) return
                    let headerNum = '#'.repeat(value)
                    stringToAdd += '\n' + headerNum + ' heading ' + value
                    newSelectionStart += Number(value) + 2
                    newSelectionEnd += stringToAdd.length
                    document.getElementById('header-select').value = "defaultValue";
                    break;
                case 'bold':
                    stringToAdd += '**bold text**'
                    newSelectionStart += 2
                    newSelectionEnd += stringToAdd.length - 2
                    break;
                case 'italic':
                    stringToAdd += '_italic text_'
                    newSelectionStart += 1
                    newSelectionEnd += stringToAdd.length - 1
                    break;
                case 'strike':
                    stringToAdd += '~~strikethrough~~'
                    newSelectionStart += 2
                    newSelectionEnd += stringToAdd.length - 2
                    break;
                case 'code':
                    stringToAdd += '\n```\n <code></code> \n```'
                    newSelectionStart += 6
                    newSelectionEnd += stringToAdd.length - 5
                    break;
                case 'link':
                    stringToAdd += ' [link](link.com)'
                    newSelectionStart += 8
                    newSelectionEnd += stringToAdd.length - 1
                    break;
                case 'quote':
                    stringToAdd += '\n> block quote';
                    newSelectionStart += 3
                    newSelectionEnd += stringToAdd.length
                    break;
                case 'table':
                    const rows = Math.floor(document.getElementById('input-table-rows').value)
                    const cols = Math.floor(document.getElementById('input-table-cols').value)
                    if (typeof rows !== 'number' || rows < 1 || typeof cols !== 'number' || cols < 1) {
                        return
                    }
                    const header = '\n' + 'column|'.repeat(cols - 1) + (cols < 2 ? 'column|' : 'column') + '\n'
                    const divider = '-------------|'.repeat(cols - 1) + (cols < 2 ? '-------------|' : '-------------') + '\n'
                    const row = 'value' + '|value'.repeat(cols - 1) + '\n'
                    const allRows = (row).repeat(rows)
                    stringToAdd += header + divider + allRows
                    newSelectionStart += 1
                    newSelectionEnd += 1
                    break;
                case 'ul':
                    stringToAdd += '\n+  \n+  \n+  '
                    newSelectionStart += 4
                    newSelectionEnd += 4
                    break;
                case 'ol':
                    stringToAdd += '\n1.  \n2.  \n3.  '
                    newSelectionStart += 4
                    newSelectionEnd += 4
                    break;
                case 'image':
                    stringToAdd += '\n![alt text](https://google.com)'
                    newSelectionStart += 13
                    newSelectionEnd += stringToAdd.length - 1
                    break;
                case 'tab':
                    stringToAdd += '&nbsp;'.repeat(4)
                    newSelectionStart += stringToAdd.length
                    newSelectionEnd += stringToAdd.length
                    break;
            }
            const body1 = this.state.body.substring(0, selectionStart) + stringToAdd
            const body2 = this.state.body.substring(selectionEnd, this.state.body.length)
            const body = body1 + body2
            this.setState({ body }, () => {
                this.textarea.setSelectionRange(newSelectionStart, newSelectionEnd)
                this.scrollmarkdown(newSelectionStart)
            })
        }
    }
    scrollmarkdown = (selectionStart) => {
        const { scrollHeight } = this.markdown
        let numLinesToSelection = this.state.body.substring(0, selectionStart).split(/\r\n|\r|\n|#+/).length - 5
        if (numLinesToSelection < 4) { return this.markdown.scrollTo(0, 0) }
        let totalNumLines = this.state.body.substring(selectionStart).split(/\r\n|\r|\n|#+/).length
        this.markdown.scrollTo(0, (numLinesToSelection / totalNumLines) * scrollHeight)
    }
    render() {
        const { head } = this.state
        return (
            <div >
                <div className="columns is-centered is-multiline">
                    <div className={`column is-5-desktop is-10-tablet is-full-mobile has-text-centered ${this.state.preview ? 'is-hidden-touch' : ''}`}>
                        <form action="" className="form">
                            <div className="field has-text-centered">
                                <label className="label">Title</label>
                                <div className="control">
                                    <input onChange={e => this.setState({ title: e.target.value, head: true })} value={this.state.title} className="input" type="text" placeholder="Title" />
                                </div>
                            </div>
                            <div className="field has-text-centered">
                                <label className="label">Caption</label>
                                <div className="control">
                                    <input onChange={e => this.setState({ caption: e.target.value, head: true })} value={this.state.caption} className="input" type="text" placeholder="Caption" />
                                </div>
                            </div>
                            <div className="field has-text-centered">
                                <label className="label">Tags</label>
                                <div className="control">
                                    <input onChange={e => { this.setState({ tags: e.target.value, head: true }) }} value={this.state.tags} className="input" type="text" placeholder="#tags" />
                                </div>
                            </div>
                            <div className="card has-text-centered">
                                <header className="card-header has-background-black has-text-centered">
                                    <div className="buttons">
                                        <div className="control has-icons-left select-container">
                                            <div className="select is-black is-small">
                                                <select value={""} id="header-select" onChange={this.modifyText('header')}>
                                                    <option></option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                </select>
                                            </div>
                                            <div className="icon is-small is-left has-text-black">
                                                <i className="fas fa-lg fa-heading"></i>
                                            </div>
                                        </div>
                                        <button className="button is-black" onClick={this.modifyText('bold')}><span className="icon is-large"><i className="fas fa-lg fa-bold"></i></span> </button>
                                        <button className="button is-black" onClick={this.modifyText('italic')}><span className="icon is-large"><i className="fas fa-lg fa-italic"></i></span> </button>
                                        <button className="button is-black" onClick={this.modifyText('strike')}><span className="icon is-large"><i className="fas fa-lg fa-strikethrough"></i></span> </button>
                                        <button className="button is-black" onClick={this.modifyText('code')}><span className="icon is-large"><i className="fas fa-lg fa-code"></i></span> </button>

                                        <div className="field has-addons">
                                            <div className="control input-container">
                                                <input id="input-table-rows" className="input is-small" type="number" max="25" min="1" placeholder="row" />
                                            </div>
                                            <div className="control input-container">
                                                <input id="input-table-cols" className="input is-small" type="number" max="5" min="1" placeholder="col" />
                                            </div>
                                            <div className="control input-container">
                                                <button onClick={this.modifyText('table')} className="button is-small">
                                                    <span className="icon">
                                                        <i className="fas fa-lg fa-table"></i>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        <button className="button is-black" onClick={this.modifyText('link')}><span className="icon is-large"><i className="fas fa-lg fa-link"></i></span> </button>
                                        <button className="button is-black" onClick={this.modifyText('quote')}><span className="icon is-large"><i className="fas fa-lg fa-quote-left"></i></span> </button>
                                        <button className="button is-black" onClick={this.modifyText('ul')}><span className="icon is-large"><i className="fas fa-lg fa-list-ul"></i></span> </button>
                                        <button className="button is-black" onClick={this.modifyText('ol')}><span className="icon is-large"><i className="fas fa-lg fa-list-ol"></i></span> </button>
                                        <button className="button is-black" onClick={this.modifyText('image')}><span className="icon is-large"><i className="fas fa-lg fa-image"></i></span> </button>


                                    </div>
                                </header>
                                <div className="field has-text-centered">
                                    <div className="control">
                                        <textarea onSelect={e => this.scrollmarkdown(e.target.selectionStart || 0)}
                                            onChange={(e) => this.setState({ body: e.target.value })} value={this.state.body}
                                            onKeyDown={e => { if (e.keyCode === 9) { this.modifyText('tab')(e) } }}
                                            className="textarea" type="text" placeholder="Post text goes here" />
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>
                    <div className="preview has-text-centered is-hidden-desktop">
                        <button onClick={() => this.setState({ preview: !this.state.preview })} className="button is-large is-primary is-rounded font-2"> <span className="icon">{this.state.preview ? <i className="fas fa-pencil-alt"></i> : <i className="far fa-eye"></i>}</span> </button>
                    </div>
                    <div className={`column is-5-desktop is-10-tablet is-full-mobile ${this.state.preview ? '' : 'is-hidden-touch'}`}>
                        <div className="card article">
                            <div className="card-content">
                                <button id="toggle-header" onClick={() => this.setState({ head: !this.state.head })} className={`button ${this.state.head ? 'is-warning' : 'is-success'}`}><span className="icon">{this.state.head ? <i className="fas fa-window-minimize"></i> : <i className="far fa-window-maximize"></i>}</span></button>
                                <div className={`media ${this.state.head ? '' : 'is-hidden'}`}>
                                    <div className="media-center">
                                        <img src={`/static/user_image.png`} className="author-image" />
                                    </div>

                                    <div className="media-content has-text-centered">
                                        <p id="title" className="title is-1 article-title font-2">{this.state.title}</p>
                                        <div className="caption content is-size-3">
                                            <div className="columns is-mobile is-centered">
                                                <div className="column is-1"><i className="fas fa-quote-left fa-pull-left"></i></div>
                                                <div id="caption" className="column is-9">{this.state.caption}</div>
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
                    .form{
                        margin-top: 3rem
                    }
                    .textarea{
                        height: 50vh
                    }
                    .card-header{
                        display: flex;
                        justify-content: center;
                    }
                    buttons .button{
                        border: none
                    }
                    .select-container{
                        margin-top: -0.4rem
                    }
                    .input-container{
                        margin-bottom: -0.8rem
                    }
                    .preview{
                       position: fixed;
                        bottom: 1rem; 
                        right: 2rem;
                        z-index:10;
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
                        box-shadow: 0px 1px 1px gray;
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
                    .markdown-body{
                        height: ${head ? '35vh' : '80vh'};
                        overflow: scroll;
                    }
                    .load-error{
                        margin-top: 40vh
                    }
                    .post-stats{
                        display: flex;
                        align-items: center;
                    }
                    #toggle-header{
                        position: absolute;
                        top: 1rem;
                        left: 1rem;
                    }
                    #caption, #title{
                        word-break: break-word
                    }
                    `}</style>
            </div>
        );
    }
}

export default NewPost;
