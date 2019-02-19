import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import { LOGIN } from '../../apollo/mutations';
import ErrorMessage from '../meta/ErrorMessage';
import { renderModal, clearError } from '../../apollo/clientWrites';



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
        return (<Mutation mutation={LOGIN} refetchQueries={[`Authenticated`, `CurrentUser`, `UserProfile`, `Comments`, `Replies`, `UserPhoto`, `ILike`, `PostAuthor`, `UserPosts`, `UserLikes`, `Followers`, `Following`, `Likers`, `Notifications`, `FolloweePosts`, `IsAdmin`]} >
            {(login, { data, loading, error }) => {
                if (!data) return (
                    <form onSubmit={this.onSubmit(login)} className="form has-text-centered">
                        {loading && <Loading color="primary" size="4x" />}
                        <ErrorMessage />
                        {this.renderInput('username')}
                        {this.renderInput('password')}
                        <button className="button is-success" type="submit">Login</button>
                        <a onClick={() => { clearError(); renderModal({ confirmation: null, display: 'Register', active: true }) }} className="button is-text">Sign Up</a>
                    </form>
                )
                if (data.login) {
                    this.props.onComplete(true)
                    return <p>Success</p>
                } else {
                    this.props.onComplete(false)
                    return <p>Login Failed</p>
                }
            }}
        </Mutation>
        )
    }
}

export default Login;
