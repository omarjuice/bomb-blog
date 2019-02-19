import gql from "graphql-tag";

export const NEW_POST = gql`
    subscription NewPost($id: Int!){
        newPost(id:$id){
            id
            title
            caption
            author{
                id
                username
                profile{
                    user_id
                    photo_path
                }
            }
            tags{
                id
                tag_name
            }
            image
            created_at
    }
}
`
export const NEW_COMMENT = gql`
    subscription NewComment($id: Int!){
        newComment(id:$id){
            id
            comment_text
            post{
                id
                title
            }
            commenter{
                id
                username
                profile{
                    user_id
                    photo_path
                }
            }
            tags{
                id
                tag_name
            }
            created_at
        }
    }
`
export const NEW_LIKE = gql`
    subscription NewLike($id: Int!){
        newLike(id:$id){
            user{
                id
                username
                profile{
                    user_id
                    photo_path
                }
            }
            post{
                id
                title
                numLikes
            }
            liked_at
        }
    }
`
export const NEW_REPLY = gql`
    subscription NewReply($id: Int!){
        newReply(id:$id){
            id
            reply_text
            replier{
                id
                username
                profile{
                    user_id
                    photo_path
                }
            }
            comment{
                id
                comment_text
                post{
                    id
                    title
                }
            }
            created_at
        }
    }
`
export const NEW_COMMENT_LIKE = gql`
    subscription NewCommentLike($id: Int!){
        newCommentLike(id:$id){
            user{
                id
                username
                profile{
                    user_id
                    photo_path
                }
            }
            comment{
                id
                comment_text
                numLikes
                post{
                    id
                    title
                }
                tags{
                    id
                    tag_name
                }
            }
            liked_at
        }
    }
`
export const NEW_FOLLOWER = gql`
    subscription NewFollower($id: Int!){
        newFollower(id:$id){
            user{
                id
                username
                profile{
                    user_id
                    photo_path
                }
            }
            followed_at
        }
    }
`
export const FEATURED_POST = gql`
    subscription FeaturedPost($id: Int!){
        featuredPost(id: $id){
            post{
                id
                title
                caption
                image
                featured
            }
            featured_at
        }
    }
`