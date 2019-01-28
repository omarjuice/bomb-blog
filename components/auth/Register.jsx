import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import validator from 'email-validator';
import Loading from '../meta/Loading';
import { REGISTER } from '../../apollo/mutations';



class Register extends Component {
    state = {
        username: '',
        password: '',
        reenter: '',
        email: '',
        formErrors: {
            username: false,
            password: false,
            reenter: false,
            email: false
        }
    }
    onSubmit = (register) => {
        return async e => {
            e.preventDefault()
            const { username, password, email, reenter } = this.state;
            let errors = {
                username: !username,
                password: !password,
                reenter: !reenter || reenter !== password,
                email: !email || !validator.validate(email),
            }
            if (Object.values(errors).includes(true)) {
                return this.setState({
                    formErrors: errors
                })
            }
            e.preventDefault()
            await register({
                variables: { input: { username, password, email } }
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
            reenter: 'lock',
            email: 'envelope'
        }
        return (
            <div className="field">
                <label className="label has-text-centered">{field}</label>
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
        return (<Mutation mutation={REGISTER} refetchQueries={[`Authenticated`, `CurrentUser`, `User`]}>
            {(register, { data, loading, error }) => {
                if (loading) return <Loading />;
                if (!data) return (
                    <form action="" onSubmit={this.onSubmit(register)} className="form has-text-centered">
                        {error ? <p>{error.message.replace(/GraphQL error: /g, '')}</p> : ''}
                        {this.renderInput('username')}
                        {this.renderInput('email')}
                        {this.renderInput('password')}
                        {this.renderInput('reenter')}
                        <button className="button is-success" type="submit">Sign Up</button>
                    </form>
                )
                return <p>{data.register ? this.props.onSuccess() : 'Not Registered'}</p>
            }}
        </Mutation>
        )
    }
}

export default Register;