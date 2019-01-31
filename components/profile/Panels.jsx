import React, { Component } from 'react';
import UserPosts from './UserPosts';
import FollowPanel from './FollowPanel';
import Likes from './Likes';
class Panels extends Component {
    state = {
        display: 'posts'
    }

    changeDisplay = (display) => {
        return e => {
            if (display === this.state.display) return;
            this.setState({
                display
            })
            for (let item of document.querySelectorAll('.tabs ul li')) {
                if (item === e.target.parentElement) {
                    item.classList.add('is-active')
                } else {
                    item.classList.remove('is-active')
                }
            }
        }
    }
    getDisplay = () => {
        const displays = {
            posts: <UserPosts userId={this.props.userId} />,
            followers: <FollowPanel display="followers" userId={this.props.userId} />,
            following: <FollowPanel display="following" userId={this.props.userId} />,
            likes: <Likes userId={this.props.userId} />
        }
        return displays[this.state.display]
    }

    render() {
        return (
            <>
                <div className="column is-half-desktop is-two-thirds-tablet is-full-mobile has-text-centered">
                    <div className="tabs is-toggle is-fullwidth is-small is-rounded">
                        <ul>
                            <li className="is-active" onClick={this.changeDisplay('posts')}><a>Posts</a></li>
                            <li onClick={this.changeDisplay('likes')}><a>Likes</a></li>
                            <li onClick={this.changeDisplay('followers')}><a>Followers</a></li>
                            <li onClick={this.changeDisplay('following')}><a>Following</a></li>
                        </ul>
                    </div>
                    <div id="panel-display" className="box has-text-centered">
                        {this.getDisplay()}
                    </div>
                </div>
                <style jsx>{`
                #panel-display{
                    position: relative;
                    top: -1.45rem
                }
                `}</style>
            </>
        )


    }
}

export default Panels;
