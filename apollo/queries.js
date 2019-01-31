import gql from "graphql-tag";
import Index from '../pages/index';

export const USER_PROFILE = gql`
    query UserProfile($id: Int){
        user(id: $id){
            id
            username
            email
            created_at
            profile{
                user_id
                about
                photo_path
                last_updated
            }
            isMe
            imFollowing
            followingMe
            numFollowers
            numFollowing
        }
    }
`
export const FOLLOWERS = gql`
    query Followers($id: Int){
        user(id: $id){
            id
            username
            followers{
                id
                username
                followed_at
                followingMe
                imFollowing
                isMe
                profile{
                    photo_path
                }
            }
            isMe
        }
    }
`
export const FOLLOWING = gql`
    query Following($id: Int){
        user(id: $id){
            id
            username
            following{
                id
                username
                followed_at
                followingMe
                imFollowing
                isMe
                profile{
                    photo_path
                }
            }
            isMe
        }
    }
`
export const LIKES = gql`
    query UserLikes($id: Int){
        user(id: $id){
            id
            username
            likedPosts{
                id
                title
                author{
                    id
                    username
                    isMe
                    profile{
                        photo_path
                    }
                }
                caption
                numLikes
                numComments
                created_at
                iLike
            }
            isMe
        }
    }
`
export const USER_POSTS = gql`
    query UserPosts($id: Int){
        user(id: $id){
            id
            username
            posts{
                id
                title
                created_at
                last_updated
                numLikes
                numComments
                caption
                iLike 
            }
            profile{
                photo_path
            }
            isMe
        }
    }
`
export const USER_TAGS = gql`
    query UserTags($id: Int){
        user(id: $id){
            id
            username
            tags{
                id
                tag_name
            }
            isMe
        } 
    }
`
export const AUTHENTICATED = gql`
    query Authenticated{
        authenticated
    }
`
export const CURRENT_USER = gql`
    query CurrentUser{
        user{
            id
            username
        }
    }
`
export const USERS = gql`
    query Users($limit: Int, $order: Boolean, $orderBy: String, $search: String){
        users(limit: $limit, order: $order, orderBy: $orderBy, search: $search){
            id
            username
            created_at
        }  
    }
`
export const POST = gql`
    query Post($id: Int!){
        post(id: $id){
            id
            user_id
            author{
                id
                username
                isMe
                profile{
                    photo_path
                }
                imFollowing
            }
            created_at
            last_updated 
            title
            caption
            post_content
            tags{
                id
                tag_name
            }
            numLikes
            numComments
            iLike
        }
    }
`
export const ILIKEPOST = gql`
    query ILike($id: Int!){
        post(id: $id){
            id
            iLike
        }
    }
`

export const FOLLOWFACTS = gql`
    query FollowFacts($id: Int){
        user(id: $id){
            imFollowing
            followingMe
        }
    }
`
export const COMMENTS = gql`
    query Comments($id: Int!){
        post(id: $id){
            id
            comments{
                id
                commenter{
                    id
                    username
                    profile{
                        user_id
                        photo_path
                    }
                }
                created_at
                last_updated
                comment_text
                numLikes
                tags{
                    id
                    tag_name
                }
                iLike
                numReplies
            }
        }
    }
`
export const ERROR = gql`
query GetError{
    error @client{
        exists
        message 
        code
        global
    }
}
`