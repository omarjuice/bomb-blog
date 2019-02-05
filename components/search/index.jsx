import React, { Component } from 'react';
import { getMatches } from '../../utils/index';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import { SEARCH_USERS, SEARCH_POSTS, SEARCH_ALL } from '../../apollo/queries';
import { Query } from 'react-apollo';
import Posts from './Posts';
class SearchPage extends Component {
    render() {
        const { input, options } = this.props
        if (!input) {
            return (
                <div>No Search</div>
            )
        }
        const tagRegex = /#(\w+)/g
        const tags = getMatches(input, tagRegex) || [];
        const search = input ? input.replace(tagRegex, '').trim().replace(/\s+/g, ' ') : ''
        const limit = options === 'all' ? 5 : 10
        const variables = {
            input: {
                search,
                tags,
                limit,
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
            header += ' ' + tags.map(tag => '#' + tag).join(' ')
        };
        return (
            <div>
                <div className="columns is-centered is-mobile is-multiline">
                    <Query query={gqlQueries[options]} variables={variables}>
                        {({ loading, error, data }) => {
                            if (loading) return <Loading />
                            if (error) return <ErrorIcon />
                            return (<>
                                <div className="column is-full has-text-centered">
                                    <h1 className="title is-2">{data.users.length < 1 && data.posts.length < 1 ? `No results found for ${header}` : `Results for ${header}`}</h1>
                                </div>
                                {data.posts ?
                                    <div className="column is-one-third-desktop is-half-tablet is-full-mobile">
                                        <div className="box">
                                            <article className="media">
                                                <figure className="media-left">
                                                </figure>
                                                <div className="media-content font-2 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <h2 className="subtitle is-3">Posts</h2>

                                                    </div>
                                                </div>

                                            </article>

                                            <Posts data={data.posts} input={variables.input} />
                                        </div>
                                    </div> : ''}
                            </>
                            )
                        }}
                    </Query>
                </div>
                <style jsx>{`
                .columns{
                    margin-top: 5rem;
                }
                `}</style>
            </div>
        );
    }
}

export default SearchPage;
