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
                image
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
            profile{
                user_id
                photo_path
            }
        }
    }
`
export const CURRENT_USER_TAGS = gql`
    query CurrentUserTags{
        user{
            id
            tags{
                id
                tag_name
            }
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
            author{
                id
                profile{
                    photo_path
                }
            }
            user_id 
            created_at
            last_updated 
            title
            caption
            post_content
            tags{
                id
                tag_name
            }
            numComments
            image
        }
    }
`
export const POST_AUTHOR = gql`
    query PostAuthor($id: Int!){
        user(id: $id){
                id
                username
                isMe
                imFollowing
        }
    }
`
export const POST_LIKES = gql`
    query ILike($id: Int!){
        post(id: $id){
            id
            iLike
            numLikes
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
                post_id
                commenter{
                    id
                    username
                    profile{
                        user_id
                        photo_path
                    }
                    isMe
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
export const REPLIES = gql`
    query Replies($id: Int!){
        comment(id: $id){
            id
            replies{
                id
                comment_id
                reply_text
                replier{
                    id
                    username
                    profile{
                        user_id
                        photo_path
                    }
                    isMe
                }
                created_at
                last_updated
            }
        }
    }
`
export const LIKERS = gql`
    query Likers($id: Int!){
        post(id: $id){
            id
            likers{
                id
                username
                profile{
                    photo_path
                }
                isMe
                imFollowing
                followingMe
                liked_at
            }
        }
    }
`
export const COMMENT_LIKERS = gql`
    query CommentLikers($id: Int!){
        comment(id: $id){
            id
            likers{
                id
                username
                profile{
                    photo_path
                }
                isMe
                imFollowing
                followingMe
                liked_at
            }
        }
    }
`
export const SEARCH_POSTS = gql`
    query SearchPosts($input: Search!){
        posts(input: $input){
            cursor
            results{
                id
                user_id
                author{
                    id
                    isMe
                    username
                    profile{
                        user_id
                        photo_path
                    }
                }
                relevance
                title
                created_at
                last_updated
                numLikes
                numComments
                caption
                iLike 
                tags{
                    id
                    tag_name
                }
                image
            }
        }
    }
`
export const SEARCH_USERS = gql`
    query SearchUsers($input: Search!){
        users(input: $input){
            cursor
            results{
                id
                relevance
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
                tags{
                    id
                    tag_name
                }
            }
        }
    }
`
export const SEARCH_COMMENTS = gql`
    query SearchComments($input: Search!){
        comments(input: $input){
            cursor
            results{
                id
                post_id
                commenter{
                    id
                    username
                    profile{
                        user_id
                        photo_path
                    }
                    isMe
                }
                post{
                    id
                    title
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
export const SEARCH_TAGS = gql`
    query SearchTags($input: Search!){
        tags(input: $input){
            cursor
            results{
                id
                tag_name
                relevance 
                popularity
                created_at
            }
        }
    }
`
export const SEARCH_ALL = gql`
    query SearchAll($input: Search!){
        users(input: $input){
            cursor
            results{
                id
                relevance
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
                tags{
                    id
                    tag_name
                }
            }
        }
        posts(input: $input){
            cursor
            results{
                id
                user_id
                author{
                    id
                    username
                    isMe
                    profile{
                        user_id
                        photo_path
                    }
                }
                relevance
                title
                created_at
                last_updated
                numLikes
                numComments
                caption
                iLike 
                tags{
                    id
                    tag_name
                }
                image
            }
        }
        comments(input: $input){
            cursor
            results{
                id
                post_id
                commenter{
                    id
                    username
                    profile{
                        user_id
                        photo_path
                    }
                    isMe
                }
                post{
                    id
                    title
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
        tags(input: $input){
            cursor
            results{
                id
                tag_name
                relevance 
                popularity
                created_at
            }
        }
    }
`
export const TRENDING = gql`
    query SearchPosts($input: Search!){
        posts(input: $input){
            cursor
            results{
                id
                user_id
                author{
                    id
                    isMe
                    username
                    profile{
                        user_id
                        photo_path
                    }
                }
                title
                created_at
                last_updated
                numLikes
                numComments
                caption
                post_content
                tags{
                    id
                    tag_name
                }
                image
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
export const GET_MODAL = gql`
    query GetModal{
        modal @client{
            active
            message
            display
            info
            confirmation
        }
    }
`
export const GET_SEARCH = gql`
    query GetSearch{
        search @client{
            input
            options
            active
            addToInput
        }
    }
`
