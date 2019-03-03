import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import validator from 'email-validator';
import Loading from '../meta/Loading';
import ErrorMessage from '../meta/ErrorMessage';
import { REGISTER, CREATE_SECRET } from '../../apollo/mutations';
import { clearError } from '../../apollo/clientWrites';



class Register extends Component {
    state = {
        username: '',
        password: '',
        reenter: '',
        email: '',
        question: '',
        answer: '',
        errors: {
            username: null,
            password: null,
            reenter: null,
            email: null,
            question: null,
            answer: null
        }
    }
    onSubmit = (register, client) => {
        return async e => {
            e.preventDefault()
            const { username, password, email, reenter, question, answer } = this.state;
            const errors = {}
            if (!username) {
                errors.username = 'Username required'
            }
            if (!password) {
                errors.password = 'Password required'
            }
            if (!reenter && password) {
                errors.reenter = 'Please reenter your password'
            }
            if (!email || !validator.validate(email)) {
                errors.email = 'Reenter a valid email'
            }
            if (!question) {
                errors.question = 'Please enter a secret question'
            }
            if (!answer) {
                errors.answer = 'Please enter an answer'
            }
            if (username.length > 25) {
                errors.username = 'Username too long. Max 25 characters'
            }
            if (password.length > 30) {
                errors.password = 'Password too long. Max 30 characters'
            }
            if (/[^\w\._]|\.\.+/g.test(username.trim())) {
                errors.username = 'Username may only contain letters, numbers, and single dots.'
            }
            if (Object.values(errors).filter(e => e).length) {
                return this.setState({
                    errors
                })
            }
            const { data } = await register({
                variables: { input: { username: username.trim(), password, email } }
            })

            if (data.register) {
                client.mutate({ mutation: CREATE_SECRET, variables: { question, answer } })
            }

        }
    }
    render() {
        return (<Mutation mutation={REGISTER} refetchQueries={[`Authenticated`, `Notifications`, `CurrentUser`, `User`,]}>
            {(register, { data, loading, error, client }) => {
                if (!data) return (
                    <form onSubmit={this.onSubmit(register, client)} className="form has-text-centered">
                        {loading && <Loading color="primary" size="4x" />}
                        <ErrorMessage />
                        <div className="field">
                            <label className="label has-text-centered">Username</label>
                            <div className="control has-icons-left">
                                <input type="text" className={`input ${this.state.errors.username && 'is-danger'}`} onChange={e => this.setState({ username: e.target.value, errors: { ...this.state.errors, username: null } })} />
                                <span className="icon is-small is-left">
                                    <i className={`fas fa-user`}></i>
                                </span>
                            </div>
                            <p className="help is-danger">{this.state.errors.username}</p>
                        </div>
                        <div className="field">
                            <label className="label has-text-centered">Email</label>
                            <div className="control has-icons-left">
                                <input type="email" className={`input ${this.state.errors.email && 'is-danger'}`} onChange={e => this.setState({ email: e.target.value, errors: { ...this.state.errors, email: null } })} />
                                <span className="icon is-small is-left">
                                    <i className={`fas fa-envelope`}></i>
                                </span>
                            </div>
                            <p className="help is-danger">{this.state.errors.email}</p>
                        </div>
                        <div className="field">
                            <label className="label has-text-centered">Password</label>
                            <div className="control has-icons-left">
                                <input type="password" className={`input ${this.state.errors.password && 'is-danger'}`} onChange={e => this.setState({ password: e.target.value, errors: { ...this.state.errors, password: null } })} />
                                <span className="icon is-small is-left">
                                    <i className={`fas fa-lock`}></i>
                                </span>
                            </div>
                            <p className="help is-danger">{this.state.errors.password}</p>
                        </div>
                        <div className="field">
                            <label className="label has-text-centered">Re-Enter</label>
                            <div className="control has-icons-left">
                                <input type="password" className={`input ${this.state.errors.reenter && 'is-danger'}`} onChange={e => this.setState({ reenter: e.target.value, errors: { ...this.state.errors, reenter: null } })} />
                                <span className="icon is-small is-left">
                                    <i className={`fas fa-lock`}></i>
                                </span>
                            </div>
                            <p className="help is-danger">{this.state.errors.reenter}</p>
                        </div>
                        <div className="field">
                            <label className="label has-text-centered">Secret Question</label>
                            <div className="control has-icons-left">
                                <input type="text" className={`input ${this.state.errors.question && 'is-danger'}`} onChange={e => this.setState({ question: e.target.value, errors: { ...this.state.errors, question: null } })} />
                                <span className="icon is-small is-left">
                                    <i className={`fas fa-question`}></i>
                                </span>
                            </div>
                            <p className="help is-danger">{this.state.errors.question}</p>
                        </div>
                        <div className="field">
                            <label className="label has-text-centered">Answer</label>
                            <div className="control has-icons-left">
                                <input type="password" className={`input ${this.state.errors.answer && 'is-danger'}`} onChange={e => this.setState({ answer: e.target.value, errors: { ...this.state.errors, answer: null } })} />
                                <span className="icon is-small is-left">
                                    <i className={`fas fa-mask`}></i>
                                </span>
                            </div>
                            <p className="help is-danger">{this.state.errors.answer}</p>
                        </div>
                        <button className={`button is-success ${this.state.loading && 'is-loading'} ${Object.values(this.state.errors).filter(e => e).length && 'is-static'}`} type="submit">Sign Up</button>
                        <a onClick={() => { clearError(); renderModal({ confirmation: null, display: 'Login', active: true }) }} className="button is-text">Login</a>
                    </form>
                )
                return <p>{data.register ? this.props.onComplete(true) : 'Not Registered'}</p>
            }}
        </Mutation>
        )
    }
}

export default Register;