import React, { Component } from 'react';

class EditBar extends Component {
    render() {
        const { modifyText } = this.props
        return (<div>
            <header className="card-header has-background-black has-text-centered">
                <div className="buttons">
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
                    <button className="button is-black" onClick={modifyText('bold')}><span className="icon is-large"><i className="fas fa-lg fa-bold"></i></span> </button>
                    <button className="button is-black" onClick={modifyText('italic')}><span className="icon is-large"><i className="fas fa-lg fa-italic"></i></span> </button>
                    <button className="button is-black" onClick={modifyText('strike')}><span className="icon is-large"><i className="fas fa-lg fa-strikethrough"></i></span> </button>
                    <button className="button is-black" onClick={modifyText('code')}><span className="icon is-large"><i className="fas fa-lg fa-code"></i></span> </button>

                    <div className="field has-addons">
                        <div className="control input-container">
                            <input id="input-table-rows" className="input is-small" type="number" max="25" min="1" placeholder="row" />
                        </div>
                        <div className="control input-container">
                            <input id="input-table-cols" className="input is-small" type="number" max="5" min="1" placeholder="col" />
                        </div>
                        <div className="control input-container">
                            <button onClick={modifyText('table')} className="button is-small">
                                <span className="icon">
                                    <i className="fas fa-lg fa-table"></i>
                                </span>
                            </button>
                        </div>
                    </div>
                    <button className="button is-black" onClick={modifyText('link')}><span className="icon is-large"><i className="fas fa-lg fa-link"></i></span> </button>
                    <button className="button is-black" onClick={modifyText('quote')}><span className="icon is-large"><i className="fas fa-lg fa-quote-left"></i></span> </button>
                    <button className="button is-black" onClick={modifyText('ul')}><span className="icon is-large"><i className="fas fa-lg fa-list-ul"></i></span> </button>
                    <button className="button is-black" onClick={modifyText('ol')}><span className="icon is-large"><i className="fas fa-lg fa-list-ol"></i></span> </button>
                    <button className="button is-black" onClick={modifyText('image')}><span className="icon is-large"><i className="fas fa-lg fa-image"></i></span> </button>
                </div>
            </header>
            <style jsx>{`
                .card-header{
                    display: flex;
                    align-items: center;
                    justify-content: center
                }
                .select-container{
                        margin-top: -0.4rem
                    }
                    .input-container{
                        margin-bottom: -0.8rem
                    }
                `}</style>
        </div>
        );
    }
}

export default EditBar;
