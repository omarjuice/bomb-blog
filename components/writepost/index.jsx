import React, { Component } from 'react';
import { getMatches, tagRegex } from '../../utils/index';
import ToolBar from './ToolBar';
import PostHead from './PostHead';
import Preview from './Preview';

class WritePost extends Component {
    state = {
        preview: false,
        title: this.props.title || '',
        caption: this.props.caption || '',
        tags: this.props.tags || '',
        body: this.props.body || '',
        image: this.props.image || '',
        imageType: this.props.uploaded,
        upload: {
            valid: false,
            file: null,
            name: this.props.uploaded ? 'uploaded image' : ''
        },
        errors: {
            title: null,
            caption: null,
            tags: null,
            body: null
        }
    }
    getTags = () => {
        return getMatches(this.state.tags || '#tag', tagRegex)
    }
    componentDidMount() {
        this.markdown = document.querySelector('.markdown-body')
        this.textarea = document.querySelector('.textarea')
        window.onbeforeunload = function () {
            return true
        }
    }
    modifyText = (button) => {
        return e => {
            e.preventDefault()
            const { selectionStart, selectionEnd } = this.textarea
            let newSelectionStart = selectionStart;
            let newSelectionEnd = selectionStart
            this.textarea.focus()
            let stringToAdd = ''
            const fillText = (filler) => selectionEnd === selectionStart ? filler : this.state.body.substring(selectionStart, selectionEnd)
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
                    stringToAdd += `**${fillText('bold text')}**`
                    newSelectionStart += 2
                    newSelectionEnd += stringToAdd.length - 2
                    break;
                case 'italic':
                    stringToAdd += `_${fillText('italic text')}_`
                    newSelectionStart += 1
                    newSelectionEnd += stringToAdd.length - 1
                    break;
                case 'strike':
                    stringToAdd += `~~${fillText('strikethrough')}~~`
                    newSelectionStart += 2
                    newSelectionEnd += stringToAdd.length - 2
                    break;
                case 'code':
                    stringToAdd += '\n```\n' + fillText('<code></code>') + '\n```'
                    newSelectionStart += 6
                    newSelectionEnd += stringToAdd.length - 5
                    break;
                case 'link':
                    stringToAdd += ` [link](${fillText('https://google.com')})`
                    newSelectionStart += 8
                    newSelectionEnd += stringToAdd.length - 1
                    break;
                case 'quote':
                    stringToAdd += `\n> ${fillText('block quote')}\n`;
                    newSelectionStart += 3
                    newSelectionEnd += stringToAdd.length
                    break;
                case 'table':
                    let rows = Math.floor(document.getElementById('input-table-rows').value)
                    let cols = Math.floor(document.getElementById('input-table-cols').value)
                    if (rows > 25) rows = 25
                    if (rows < 1) rows = 1
                    if (cols > 5) cols = 5
                    if (cols < 1) cols = 1
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
                    stringToAdd += `\n![alt text](${fillText('https://google.com')})`
                    newSelectionStart += 13
                    newSelectionEnd += stringToAdd.length - 1
                    break;
                case 'line':
                    stringToAdd += `\n *** \n`
                    newSelectionStart += stringToAdd.length
                    newSelectionEnd += stringToAdd.length
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
            document.execCommand('insertText', false, stringToAdd)
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
    validate() {
        const { title, caption, tags, body, image, imageType, upload } = this.state
        const titleLen = title.length,
            captionLen = caption.length,
            tagsLen = this.getTags(tags).length,
            bodyLen = body.length,
            imageLen = image.length;

        let errors = {}
        if (titleLen < 1) {
            errors.title = 'Your post must have a title'
        }
        if (captionLen < 1) {
            errors.caption = 'Your post must have a caption'
        }
        if (tags.length < 1 || tagsLen < 1) {
            errors.tags = 'Your post must have at least one tag'
        }
        if (tagsLen > 20) {
            errors.tags = 'There are too many tags'
        }
        if (bodyLen < 100) {
            errors.body = 'Your post must be at least 100 characters long'
        }
        if (titleLen > 255) {
            errors.title = 'Your title is too long'
        }
        if (captionLen > 400) {
            errors.caption = 'Your caption is too long'
        }
        if (bodyLen > 200000) {
            errors.body = 'Your post is too long'
        }
        if (!imageType && imageLen > 255) {
            errors.image = 'Link too long'
        }
        if (imageType && upload.size > 10000000) {
            errors.image = 'Image too large'
        }
        if (!this.props.uploaded && imageType && (!upload.file || !upload.valid)) {
            console.log(upload)
            errors.image = 'No valid file uploaded'
        }
        this.setState({ errors })
        if (Object.values(errors).filter(e => e).length > 0) {
            return null
        }
        window.onbeforeunload = null
        return { title, caption, tags, body, image, imageType, upload }

    }
    componentWillUnmount() {
        window.onbeforeunload = null
    }
    render() {
        const tags = this.getTags(this.state.tags)
        return (
            <div >
                <div className="columns is-centered is-multiline">
                    <div className={`column is-5-desktop is-10-tablet is-full-mobile has-text-centered ${this.state.preview ? 'is-hidden-touch' : ''}`}>
                        <form onSubmit={this.props.onSubmit(this.validate.bind(this))} className="form">
                            <div className="field has-text-centered">
                                <label className="label">Title</label>
                                <div className="control">
                                    <input onChange={e => this.setState({ title: e.target.value, head: true, errors: { ...this.state.errors, title: null } })} value={this.state.title} className={`input ${this.state.errors.title ? 'is-primary' : ''}`} type="text" placeholder="Title" />
                                </div>
                                <p className={`help ${this.state.title.length < 1 || this.state.title.length > 255 ? 'is-primary' : ''}`}><span className="is-pulled-left">{this.state.title.length}</span><span>{this.state.errors.title}</span></p>
                            </div>
                            <div className="field has-text-centered">
                                <label className="label">Caption</label>
                                <div className="control">
                                    <input onChange={e => this.setState({ caption: e.target.value, head: true, errors: { ...this.state.errors, caption: null } })} value={this.state.caption} className={`input ${this.state.errors.caption ? 'is-primary' : ''}`} type="text" placeholder="Caption" />
                                </div>
                                <p className={`help ${this.state.caption.length < 1 || this.state.caption.length > 400 ? 'is-primary' : ''}`}><span className="is-pulled-left">{this.state.caption.length}</span><span>{this.state.errors.caption}</span></p>
                            </div>
                            <div className="field has-text-centered">
                                <label className="label">Tags</label>
                                <div className="control">
                                    <input onChange={e => { this.setState({ tags: e.target.value, head: true, errors: { ...this.state.errors, tags: null } }) }} value={this.state.tags} className={`input ${this.state.errors.tags ? 'is-primary' : ''}`} type="text" placeholder="#tags" />
                                </div>
                                <p className={`help ${tags.length < 1 || this.state.tags.length < 1 || tags.length > 20 ? 'is-primary' : ''}`}><span className="is-pulled-left">{this.state.tags.length < 1 ? 0 : tags.length}</span><span>{this.state.errors.tags}</span></p>
                            </div>

                            <div className="field has-text-centered">
                                <label className="label">Main Image</label>
                                <div className="field has-addons has-addons-centered">
                                    <p className="control ">
                                        <a onClick={() => this.setState({ imageType: false })} className={`button is-link ${!this.state.imageType ? 'is-static' : ''}`}>
                                            <span className="icon is-small">
                                                <i className="fas fa-link"></i>
                                            </span>
                                        </a>
                                    </p>
                                    <p className="control">
                                        <a onClick={() => this.setState({ imageType: true })} className={`button is-dark ${this.state.imageType ? 'is-static' : ''}`}>
                                            <span className="icon is-small">
                                                <i className="fas fa-upload"></i>
                                            </span>
                                        </a>
                                    </p>
                                </div>
                                <div className="control">

                                    {this.state.imageType ?
                                        <>
                                            <div className="file is-centered">
                                                <label className="file-label">
                                                    <input accept=".jpeg,.jpg,.png" onChange={({ target: { validity: { valid }, files: [file] } }) => {
                                                        this.setState({
                                                            upload: {
                                                                valid,
                                                                name: file.name,
                                                                file,
                                                                size: file.size
                                                            }
                                                        })
                                                    }} className="file-input" type="file" name="resume" />
                                                    <span className="file-cta">
                                                        <span className="file-icon">
                                                            <i className="fas fa-upload"></i>
                                                        </span>
                                                        <span className="file-label">
                                                            {this.state.upload.name.slice(0, 20) || 'Choose a file'}
                                                        </span>
                                                    </span>
                                                </label>
                                            </div>
                                        </> :
                                        <input onChange={e => { this.setState({ image: e.target.value, head: true, errors: { ...this.state.errors, image: null } }) }} value={this.state.image} className={`input ${this.state.errors.image ? 'is-primary' : ''}`} type="text" placeholder="Image Link" />}
                                </div>
                                <p className={`help ${!this.state.imageType && this.state.image.length > 255 ? 'is-primary' : ''}`}><span className="is-pulled-left">{!this.state.imageType && this.state.image.length}</span><span>{this.state.errors.image}</span></p>
                            </div>
                            <div className="card has-text-centered">
                                <ToolBar modifyText={this.modifyText.bind('this')} />
                                <div className="field has-text-centered">
                                    <div className="control">
                                        <textarea onSelect={e => this.scrollmarkdown(e.target.selectionStart || 0)}
                                            onChange={(e) => this.setState({ body: e.target.value, errors: { ...this.state.errors, body: null } })} value={this.state.body}
                                            onKeyDown={e => { if (e.keyCode === 9) { this.modifyText('tab')(e) } }}
                                            className={`textarea ${this.state.errors.body ? 'is-primary' : ''}`} type="text" placeholder="Post text goes here" />
                                    </div>
                                </div>
                            </div>
                            <p className={`help ${this.state.body.length < 100 || this.state.body.length > 200000 ? 'is-primary' : ''}`}><span className="is-pulled-left">{this.state.body.length}</span><span>{this.state.errors.body}</span></p>
                            <div className="field submit">
                                <div className="control">
                                    <button type="submit" className="button is-success is-large font-1">Submit</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <Preview body={this.state.body || '# post-body'} preview={this.state.preview} >
                        <PostHead title={this.state.title || 'Title of Post'} caption={this.state.caption || 'I am the bomb'} tags={tags} image={this.state.imageType && this.state.upload.file ? URL.createObjectURL(this.state.upload.file) : this.state.image} />
                    </Preview>
                    <div className="control preview has-text-centered is-hidden-desktop">
                        <a onClick={() => this.setState({ preview: !this.state.preview })} className="button is-large is-primary is-rounded font-1">
                            <span className="icon">{this.state.preview ? <i className="fas fa-pencil-alt"></i> : <i className="far fa-eye"></i>}</span>
                        </a>
                    </div>


                </div>
                <style jsx>{`
                    .form{
                        margin-top: 1rem;
                        margin-bottom: 2rem;
                    }
                    .card{
                        margin-top:3rem;
                    }
                    
                    .submit{
                        position: relative;
                        left: 1rem;
                        top: 1rem
                    }
                    .textarea{
                        height: 40vh
                    }
                    .preview{
                        position: fixed;
                        z-index:10;
                        bottom: 2rem;
                        right: 2rem;
                    }
                    @media only screen and (min-width: 767px){
                        .preview{
                            bottom: 10rem;
                            right: 4rem;

                        }
                    }
                    `}</style>
            </div >
        );
    }
}

export default WritePost;
