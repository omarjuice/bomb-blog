import React, { Component } from 'react';

import { getMatches } from '../../utils/index';

import EditBar from './EditBar';
import PostHead from './PostHead';
import Preview from './Preview';

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
                                <EditBar modifyText={this.modifyText.bind('this')} />
                                <div className="field has-text-centered">
                                    <div className="control">
                                        <textarea onSelect={e => this.scrollmarkdown(e.target.selectionStart || 0)}
                                            onChange={(e) => this.setState({ body: e.target.value })} value={this.state.body}
                                            onKeyDown={e => { if (e.keyCode === 9) { this.modifyText('tab')(e) } }}
                                            className="textarea" type="text" placeholder="Post text goes here" />
                                    </div>
                                </div>
                            </div>
                            <div className="field is-grouped is-grouped-centered submit">
                                <div className="control">
                                    <button className="button is-success is-large font-2">Submit</button>
                                </div>
                                <div className="control has-text-centered is-hidden-desktop">
                                    <a onClick={() => this.setState({ preview: !this.state.preview })} className="button is-large is-primary is-rounded font-2">
                                        <span className="icon">{this.state.preview ? <i className="fas fa-pencil-alt"></i> : <i className="far fa-eye"></i>}</span>
                                    </a>
                                </div>
                            </div>

                        </form>

                    </div>
                    <Preview body={this.state.body} >
                        <PostHead title={this.state.title} caption={this.state.caption} getTags={this.getTags.bind(this)} />
                    </Preview>


                </div>
                <style jsx>{`
                    .form{
                        margin-top: 2rem
                    }
                    .textarea{
                        height: 50vh
                    }
                    .preview{
                        position: relative;
                  
                        z-index:10;
                    }
                    
                    .submit{
                       margin-top: 1rem;
                    }

                    `}</style>
            </div>
        );
    }
}

export default NewPost;
