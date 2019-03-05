import React, { Component } from 'react';

class ToolBar extends Component {
    render() {
        const { modifyText } = this.props
        return (<div>
            <header className="card-header has-background-black has-text-centered">
                <div className="buttons">
                    <a className="has-text-light" onClick={() => document.execCommand('undo')}><span className="icon is-large"><i className="fas fa-lg fa-undo"></i></span> </a>
                    <a className="has-text-light" onClick={() => document.execCommand('redo')}><span className="icon is-large"><i className="fas fa-lg fa-redo"></i></span> </a>
                    <div className="control has-icons-left select-container">
                        <div className="select is-black is-small">
                            <select value={""} id="header-select" onChange={modifyText('header')}>
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

                    <a className="has-text-light" onClick={modifyText('bold')}><span className="icon is-large"><i className="fas fa-lg fa-bold"></i></span> </a>
                    <a className="has-text-light" onClick={modifyText('italic')}><span className="icon is-large"><i className="fas fa-lg fa-italic"></i></span> </a>
                    <a className="has-text-light" onClick={modifyText('strike')}><span className="icon is-large"><i className="fas fa-lg fa-strikethrough"></i></span> </a>
                    <a className="has-text-light" onClick={modifyText('quote')}><span className="icon is-large"><i className="fas fa-lg fa-quote-left"></i></span> </a>
                    <a className="has-text-light" onClick={modifyText('code')}><span className="icon is-large"><i className="fas fa-lg fa-code"></i></span> </a>


                    <a className="has-text-light" onClick={modifyText('link')}><span className="icon is-large"><i className="fas fa-lg fa-link"></i></span> </a>
                    <a className="has-text-light" onClick={modifyText('image')}><span className="icon is-large"><i className="fas fa-lg fa-image"></i></span> </a>
                    <a className="has-text-light" onClick={modifyText('ul')}><span className="icon is-large"><i className="fas fa-lg fa-list-ul"></i></span> </a>
                    <a className="has-text-light" onClick={modifyText('ol')}><span className="icon is-large"><i className="fas fa-lg fa-list-ol"></i></span> </a>
                    <a className="has-text-light" onClick={modifyText('line')}><span className="icon is-large"><i className="fas fa-lg fa-grip-lines"></i></span> </a>
                    <div className="field has-addons">
                        <div className="control input-container">
                            <input id="input-table-rows" className="input is-small" type="number" max="25" min="1" placeholder="row" />
                        </div>
                        <div className="control input-container">
                            <input id="input-table-cols" className="input is-small" type="number" max="5" min="1" placeholder="col" />
                        </div>
                        <div className="control input-container">
                            <a onClick={modifyText('table')} className="button is-small">
                                <span className="icon">
                                    <i className="fas fa-lg fa-table"></i>
                                </span>
                            </a>
                        </div>
                    </div>

                </div>
            </header>
            <style jsx>{`
                .button{
                    border: none;
                }
                select:focus, input:focus{
                    font-size: 13px !important
                }
                .card-header{
                    display: flex;
                    align-items: center;
                    justify-content: center
                }
                
                `}</style>
        </div>
        );
    }
}

export default ToolBar;
