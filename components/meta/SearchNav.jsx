import React, { Component } from 'react';
import { setSearch } from '../../apollo/clientWrites';


class SearchNav extends Component {
    state = {
        input: '',
        optionsActive: false,
        options: 'all'
    }
    componentDidMount() {
        const { search: { input, options } } = this.props
        this.setState({
            input,
            options
        })
    }
    componentDidUpdate() {
        const { search: { addToInput } } = this.props
        if (addToInput && !this.state.input.includes(addToInput)) {
            this.setState({
                input: this.state.input + addToInput
            }, () => {
                setSearch({ addToInput: '' })
            })

        }
    }
    render() {
        return (
            <nav className={`navbar is-fixed-top secondary-navbar ${this.props.active ? '' : 'is-hidden'}`} role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <div className="navbar-item">
                        <form action="/search" className="form" method="GET">
                            <div className="field has-addons has-addons-right">
                                <p className="control">
                                    <span className="select">
                                        <select name="options" onChange={(e) => this.setState({ options: e.target.value })} value={this.state.options}>
                                            <option>all</option>
                                            <option>users</option>
                                            <option>posts</option>
                                            <option>comments</option>
                                            <option>tags</option>
                                        </select>
                                    </span>
                                </p>
                                <p className="control">
                                    <input className="input" name="input" type="text" placeholder="Search or #tags" onChange={e => this.setState({ input: e.target.value })} value={this.state.input} />
                                </p>
                                <p className="control">
                                    <button type="submit" className="button is-info font-2">
                                        <i className="fas fa-search"></i>
                                    </button >

                                </p>
                            </div>
                        </form>
                    </div>

                </div>

            </nav >
        );
    }
}

export default SearchNav;
