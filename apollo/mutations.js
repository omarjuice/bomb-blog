import gql from "graphql-tag";

export const FOLLOW = gql`
    mutation CreateFollow($user_id: Int!){
        createFollow(user_id: $user_id)
    }
`
export const UNFOLLOW = gql`
    mutation DeleteFollow($user_id: Int!){
        deleteFollow(user_id: $user_id)
    }
`
export const LOGIN = gql`
    mutation Login($username: String, $password: String){
        login(username: $username, password: $password)
    }
`
export const LOGOUT = gql`
    mutation Logout{
        logout
    }
`
export const REGISTER = gql`
    mutation Register($input: Register!){
        register(input: $input)
    }
`
export const UPDATE_PROFILE = gql`
    mutation UpdateProfile($input: ProfileDetails){
            updateProfile(input: $input){
                user_id
                about
                photo_path
                last_updated
            }
    }
`
export const CREATE_COMMENT = gql`
    mutation CreateComment($post_id: Int!, $comment_text: String!, $tags:[String]!){
        createComment(post_id: $post_id, comment_text: $comment_text, tags: $tags){
            id
            post_id
            created_at
            last_updated
            comment_text
            tags{
                id
                tag_name
            }
        }
    }
`
export const DELETE_COMMENT = gql`
    mutation DeleteComment($comment_id: Int!){
        deleteComment(comment_id: $comment_id)
    }
`

export const CREATE_REPLY = gql`
    mutation CreateReply($comment_id: Int!, $reply_text: String!){
        createReply(comment_id: $comment_id, reply_text: $reply_text){
            id
            comment_id
            reply_text
            created_at
            last_updated
        }
    }
`
export const DELETE_REPLY = gql`
    mutation DeleteReply($reply_id: Int!){
        deleteReply(reply_id: $reply_id)
    }
`
export const UPDATE_REPLY = gql`
    mutation UpdateReply($reply_id: Int!, $reply_text: String!){
        updateReply(reply_id: $reply_id, reply_text: $reply_text){
            id
            comment_id
            reply_text
            last_updated
        }
    }
`