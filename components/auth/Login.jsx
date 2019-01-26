import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const LOGIN = gql`
    mutation Login($username: String, $password: String){
        login(username: $username, password: $password)
    }
`

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
            // this.setState({
            //     username: '',
            //     password: ''
            // })
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
        return (<Mutation mutation={LOGIN} refetchQueries={[`Authenticated`, `CurrentUser`]} >
            {(login, { data, loading, error }) => {
                if (!data) return (
                    <form action="" onSubmit={this.onSubmit(login)} className="form has-text-centered">
                        {loading && <p>Loading...</p>}
                        <p>{error ? error.message.replace(/GraphQL error: /g, '') : ''}</p>
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
