import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import { LOGIN } from '../../apollo/mutations';
import ErrorMessage from '../meta/ErrorMessage';



class Login extends Component {
    state = {
        touched: false,
        username: '',
        password: '',
        formErrors: {
            username: false,
            password: false
        },
    }
    onSubmit = (login) => {
        return async e => {
            e.preventDefault()
            const { username, password } = this.state;
            if (!username || !password) {
                return this.setState({
                    formErrors: {
                        username: !username,
                        password: !password
                    }
                })
            }
            await login({
                variables: { username: this.state.username, password: this.state.password }
            })
        }
    }
    renderInput = (field) => {
        const icons = {
            username: 'user',
            password: 'lock',
        }
        return (
            <div className="field">
                <label className="label">{field} </label>
                <div className="control has-icons-left">
                    <input type="text" className={`input ${this.state.formErrors[field] && 'is-danger'}`} onChange={e => this.setState({ [field]: e.target.value })} />
                    <span className="icon is-small is-left">
                        <i className={`fas fa-${icons[field]}`}></i>
                    </span>
                </div>
            </div>

        )
    }
    render() {
        return (<Mutation mutation={LOGIN} refetchQueries={[`Authenticated`, `CurrentUser`, `UserProfile`, `Post`, `Comments`, `Replies`, `UserPhoto`]} >
            {(login, { data, loading, error }) => {
                if (!data) return (
                    <form action="" onSubmit={this.onSubmit(login)} className="form has-text-centered">
                        {loading && <Loading color="primary" size="4x" />}
                        <ErrorMessage />
                        {this.renderInput('username')}
                        {this.renderInput('password')}
                        <button className="button is-success" type="submit">Login</button>
                    </form>
                )
                return (data.login ? <p>{this.props.onSuccess()}</p> : <p>Login Failed</p>)
            }}
        </Mutation>
        )
    }
}

export default Login;
