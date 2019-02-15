import gql from "graphql-tag";

export const NEW_POST = gql`
    subscription NewPost{
        newPost{
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
    subscription NewComment{
        newComment{
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
    subscription NewLike{
        newLike{
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
    subscription NewReply{
        newReply{
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
    subscription NewCommentLike{
        newCommentLike{
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
    subscription NewFollower{
        newFollower{
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