import React, { Component } from 'react';
import { getMatches } from '../../utils/index';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import { SEARCH_USERS, SEARCH_POSTS, SEARCH_ALL } from '../../apollo/queries';
import { Query } from 'react-apollo';
class SearchPage extends Component {
    render() {
        const { input, options } = this.props
        const tagRegex = /#(\w+)/g
        const tags = getMatches(input, tagRegex) || [];
        const search = input ? input.replace(tagRegex, '').trim().replace(/\s+/g, ' ') : ''
        const variables = {
            input: {
                search,
                tags,
                limit: options === 'all' ? 5 : 10,
                cursor: 0
            }
        }
        const gqlQueries = {
            users: SEARCH_USERS,
            posts: SEARCH_POSTS,
            all: SEARCH_ALL
        }
        let header = ''
        if (search) {
            header += search
        }
        if (tags) {
            header += tags.map(tag => '#' + tag).join(' ')
        }

        return (
            <div className="columns is-centered">

                <Query query={gqlQueries[options]} variables={variables}>
                    {({ loading, error, data }) => {
                        if (loading) return <Loading />
                        if (error) return <ErrorIcon />
                        return (
                            <div className="column has-text-centered">
                                <h1 className="title is-2">{data.users.length < 1 && data.posts.length < 1 ? `No results found for ${header}` : `Results for ${header}`}</h1>
                            </div>


                        )
                    }}
                </Query>

            </div>
        );
    }
}

export default SearchPage;
