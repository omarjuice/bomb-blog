import React, { Component } from 'react';
import Loading from '../meta/Loading';
import ErrorMessage from '../meta/ErrorMessage';
import { PASSWORD_RESET } from '../../apollo/mutations';
import { GET_QUESTION } from '../../apollo/queries';
import { renderModal, clearError } from '../../apollo/clientWrites';
class PasswordReset extends Component {
    state = {
        id: null,
        username: '',
        question: null,
        answer: '',
        password: '',
        reenter: '',
        loading: false,
        errors: {
            username: null,
            answer: null,
            newPassword: null,
            reenter: null,
        }
    }
    getQuestion = async e => {
        e.preventDefault()
        const { props: { client }, state: { username } } = this
        if (!username) {
            return this.setState({
                errors: { ...this.state.errors, username: 'You must enter a username or email.' }
            })
        }
        this.setState({ loading: true })
        const { data } = await client.query({ query: GET_QUESTION, variables: { username } })
        if (data && data.secretQuestion) {
            const { secretQuestion: { id, question } } = data
            return this.setState({
                id, question, loading: false
            })
        }
        return this.setState({
            loading: false, errors: { username: 'User not found.' }
        })
    }
    submitAnswer = async e => {
        e.preventDefault()
        const { state: { id, answer, password, reenter, username }, props: { client } } = this
        const errors = {}
        if (!answer) {
            errors.answer = 'You must answer the question'
        }
        if (!password) {
            errors.password = 'You must provide a new password'
        }
        if (password.length > 30) {
            errors.password = 'Password too long. Max 30 characters'
        }
        if (password && reenter !== password) {
            errors.reenter = 'Passwords must match'
        }
        if (Object.values(errors).length) {
            return this.setState({ errors })
        }
        this.setState({ loading: true })
        const { data: { passwordReset } } = await client.mutate({ mutation: PASSWORD_RESET, variables: { id, newPassword: password, secretAnswer: answer } })
        this.setState({ loading: false })
        if (passwordReset) {
            clearError()
            renderModal({ active: true, display: 'Login', message: 'Login with your new password', confirmation: null, info: { username } })
        }
        this.setState({
            errors: {
                answer: 'Answer is incorrect.'
            }
        })


    }
    processSubmit = () => {
        const { question } = this.state
        if (!question) {
            return this.getQuestion
        }
        if (question) {
            return this.submitAnswer
        }
    }
    render() {
        return (
            <form onSubmit={this.processSubmit()} className="form has-text-centered">
                {this.state.loading && <Loading />}
                <ErrorMessage />
                {this.state.question ?
                    <>
                        <div className="field">
                            <label className="label">{this.state.question}</label>
                            <div className="control has-icons-left">
                                <input type="password" className={`input ${this.state.errors.answer && 'is-danger'}`} onChange={e => this.setState({ answer: e.target.value, errors: { ...this.state.errors, answer: null } })} />
                                <span className="icon is-small is-left">
                                    <i className={`fas fa-mask`}></i>
                                </span>
                            </div>
                            <p className="help">{this.state.errors.answer}</p>
                        </div>
                        <div className="field">
                            <label className="label">Password</label>
                            <div className="control has-icons-left">
                                <input type="password" className={`input ${this.state.errors.password && 'is-danger'}`} onChange={e => this.setState({ password: e.target.value, errors: { ...this.state.errors, password: null } })} />
                                <span className="icon is-small is-left">
                                    <i className={`fas fa-lock`}></i>
                                </span>
                            </div>
                            <p className="help">{this.state.errors.password}</p>
                        </div>
                        <div className="field">
                            <label className="label">Re-Enter</label>
                            <div className="control has-icons-left">
                                <input type="password" className={`input ${this.state.errors.reenter && 'is-danger'}`} onChange={e => this.setState({ reenter: e.target.value, errors: { ...this.state.errors, reenter: null } })} />
                                <span className="icon is-small is-left">
                                    <i className={`fas fa-lock`}></i>
                                </span>
                            </div>
                            <p className="help">{this.state.errors.reenter}</p>
                        </div>
                    </>
                    :
                    <div className="field">
                        <label className="label">Username or Email</label>
                        <div className="control has-icons-left">
                            <input type="text" className={`input ${this.state.errors.username && 'is-danger'}`} onChange={e => this.setState({ username: e.target.value, errors: { ...this.state.errors, username: null } })} />
                            <span className="icon is-small is-left">
                                <i className={`fas fa-user`}></i>
                            </span>
                        </div>
                        <p className="help">{this.state.errors.username}</p>
                    </div>}
                <button className={`button is-success ${this.state.loading && 'is-loading'} ${Object.values(this.state.errors).filter(e => e).length && 'is-static'}`} type="submit">Submit</button>

            </form>
        );
    }
}

export default PasswordReset;
