import React, { Component } from 'react';
import marked from 'marked'
marked.setOptions({
    breaks: true,
    sanitize: true,
    gfm: true
});
class Preview extends Component {
    state = {
        head: true
    }
    render() {
        const { preview, body } = this.props
        const { head } = this.state
        return (
            <div className={`column is-5-desktop is-10-tablet is-full-mobile ${preview ? '' : 'is-hidden-touch'}`}>
                <div className="card article">
                    <div className="card-content">
                        <button id="toggle-header" onClick={() => this.setState({ head: !this.state.head })} className={`button ${this.state.head ? 'is-warning' : 'is-success'}`}><span className="icon">{this.state.head ? <i className="fas fa-window-minimize"></i> : <i className="far fa-window-maximize"></i>}</span></button>
                        {this.state.head ? this.props.children : ''}
                        <div dangerouslySetInnerHTML={{ __html: marked.parse(body) }} className="content article-body markdown-body">
                        </div>
                    </div>
                </div>
                <style jsx>{`
                .article {
                        margin-top: 3rem;
                    }
                    .markdown-body{
                        height: ${head ? 'auto' : '80vh'};
                        overflow: ${head ? 'auto' : 'scroll'};
                    }
                    #toggle-header{
                        position: absolute;
                        top: 1rem;
                        left: 1rem;
                    }
                    `}</style>
            </div>
        );
    }
}

export default Preview;
