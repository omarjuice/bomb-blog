import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import { USER_PROFILE } from '../../apollo/queries';
import Loading from '../meta/Loading';
import { UPDATE_PROFILE } from '../../apollo/mutations';
import ErrorIcon from '../meta/ErrorIcon';



class About extends Component {
    state = {
        editing: false,
        input: ''
    }
    editAbout = (about) => {
        return () => {
            this.setState({
                editing: true,
                input: about || ''
            })
        }
    }
    handleSubmit = editAbout => {
        return async e => {
            e.preventDefault();
            console.log(this.state.input);
            await editAbout({ variables: { input: { about: this.state.input } } })
            this.setState({
                editing: false,
                input: ''
            })
        }
    }
    render() {
        return (
            <Query query={USER_PROFILE} variables={{ id: this.props.userId }}>
                {({ loading, error, data }) => {
                    if (loading) return <Loading size="3x" />;
                    if (error) return <ErrorIcon size="3x" />
                    if (!this.state.editing) return (
                        <div>
                            <p>{data.user.profile.about || 'Let others know something about you!'}</p>
                            <button className="button is-info" onClick={this.editAbout(data.user.profile.about)}><i className="fas fa-pen-alt"></i></button>
                        </div>
                    )
                    return (
                        <div>
                            <Mutation mutation={UPDATE_PROFILE} refetchQueries={[`UserProfile`]}>
                                {(updateProfile, { loading, error, data }) => {
                                    if (loading) return <Loading />
                                    if (error) return <ErrorIcon />
                                    if (!data) return (
                                        <form action="" onSubmit={this.handleSubmit(updateProfile)}>
                                            <textarea className="textarea" value={this.state.input}
                                                onChange={e => this.setState({ input: e.target.value })}></textarea>
                                            <button type="submit" className="button is-info">Submit</button>
                                        </form>
                                    )
                                    return <p>DONE</p>
                                }}
                            </Mutation>
                        </div>
                    )
                }}
            </Query>
        );
    }
}

export default About;
