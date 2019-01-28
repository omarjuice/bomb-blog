import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import { USER } from '../../apollo/queries';
import Loading from '../meta/Loading';
import { UPDATE_PROFILE } from '../../apollo/mutations';
import ErrorMessage from '../meta/ErrorMessage';



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
            <Query query={USER} variables={{ id: this.props.userId }}>
                {({ loading, error, data }) => {
                    if (loading) return <Loading />;
                    if (error) return <ErrorMessage />;
                    if (!this.state.editing) return (
                        <div>
                            <p>{data.user.profile.about || 'Let others know something about you!'}</p>
                            <button className="button is-link" onClick={this.editAbout(data.user.profile.about)}><i class="fas fa-pen-alt"></i></button>
                        </div>
                    )
                    return (
                        <div>
                            <Mutation mutation={UPDATE_PROFILE} refetchQueries={[`User`]}>
                                {(updateProfile, { loading, error, data }) => {
                                    if (loading) return <Loading />
                                    if (error) return <ErrorMessage />
                                    if (!data) return (
                                        <form action="" onSubmit={this.handleSubmit(updateProfile)}>
                                            <textarea className="textarea" value={this.state.input}
                                                onChange={e => this.setState({ input: e.target.value })}></textarea>
                                            <button type="submit" className="button is-link">Submit</button>
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
