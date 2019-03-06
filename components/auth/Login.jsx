import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { LOGIN, authRefetch } from '../../apollo/mutations';
import Loading from '../meta/Loading';
import ErrorMessage from '../meta/ErrorMessage';
import { renderModal, clearError } from '../../apollo/clientWrites';
import BombSVG from '../svg/bomb';



class Login extends Component {
    state = {
        username: this.props.info ? this.props.info.username : '',
        password: '',
        errors: {
            username: null,
            password: null
        },
    }
    onSubmit = (login) => {
        return async e => {
            e.preventDefault()
            const { username, password } = this.state;
            const errors = {}
            if (!username) {
                errors.username = 'Please enter a username'
            }
            if (!password) {
                errors.password = 'Please enter a password'
            }

            if (!Object.values(errors).length) {
                const { data } = await login({
                    variables: { username: this.state.username.trim(), password: this.state.password }
                })
                if (data.login) {
                    this.props.onComplete(true)
                } else {
                    this.props.onComplete(false)
                }
            }
        }
    }
    render() {
        return (<Mutation mutation={LOGIN} refetchQueries={authRefetch} >
            {(login, { data, loading, error }) => {
                if (!data) return (
                    <div>
                        <form onSubmit={this.onSubmit(login)} className="form has-text-centered">
                            {loading && <Loading />}
                            <ErrorMessage />
                            <div className="field">
                                <label className="label">Username</label>
                                <div className="control has-icons-left">
                                    <input type="text"
                                        className={`input ${this.state.errors.username && 'is-danger'}`}
                                        value={this.state.username || ''}
                                        onChange={e => this.setState({ username: e.target.value, errors: { ...this.state.errors, username: null } })} />
                                    <span className="icon is-small is-left">
                                        <i className={`fas fa-user`}></i>
                                    </span>
                                </div>
                                <p className="help">{this.state.errors.username}</p>
                            </div>
                            <div className="field">
                                <label className="label">Password</label>
                                <div className="control has-icons-left">
                                    <input
                                        type="password"
                                        className={`input ${this.state.errors.password && 'is-danger'}`}
                                        value={this.state.password}
                                        onChange={e => this.setState({ password: e.target.value, errors: { ...this.state.errors, password: null } })} />
                                    <span className="icon is-small is-left">
                                        <i className={`fas fa-lock`}></i>
                                    </span>
                                </div>
                                <p className="help">{this.state.errors.password}</p>
                            </div>
                            <button className={`button font-1 is-success ${loading && 'is-loading'}`} type="submit">Login</button>
                            <a onClick={() => { clearError(); renderModal({ confirmation: null, display: 'Register', active: true }) }}
                                className="button is-text">
                                Sign Up
                             </a>
                        </form>
                        <a onClick={() => { clearError(); renderModal({ confirmation: null, display: 'PasswordReset', active: true, message: 'Reset your password' }) }}
                            className="button is-text">
                            Forgot your password?
                        </a>
                    </div>
                )
                return <div></div>
            }}
        </Mutation>
        )
    }
}

export default Login;
