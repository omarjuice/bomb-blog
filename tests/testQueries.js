module.exports = {
  login: {
    success: [`
        mutation{
            login(username:"alpha", password:"1234567")
          }
        `, `
        mutation{
            login(username:"beta", password:"password")
          }
        `,
      `
        mutation{
            login(username:"gamma", password:"english")
          }
        `
    ],
    fail: `
        mutation{
            login(username:"beta", password:"1234567")
          }
        `
  },
  logout: `mutation { logout }`,
  user: {
    notFound: `mutation{
            login(username:"delta", password:"1234567")
          }`
  },
  authenticate: `query { authenticated }`,
  profile: {
    get: `query($id: Int){
        user(id: $id){
          id
          username
          profile{
            user_id
            about
            photo_path
            last_updated
          }
        }
      }`,
    update: `mutation($input: ProfileDetails){
            updateProfile(input: $input)
      }`
  },
  posts: {
    all: `query ($limit: Int, $search: String){
            posts(limit: $limit, search: $search){
                  id
                  user_id
                  title
                  caption
                  created_at
                  author{
                    username
                  }
                  numLikes
            }
          }`,
    byId: `query ($id: Int!){
              post(id: $id){
                  id
                  title
                  caption
                  user_id
                  author{
                      username
                  }
                  post_content
                  created_at
                  last_updated
                  numLikes
              }
          }`,
    byUserID: `query ($id: Int){
            user(id: $id){
              username
              profile{
                about
              }
              posts{
                title
                numLikes
              }
            }
          }`,
    create: `mutation ($input: PostDetails){
            createPost(input: $input){
              id
              user_id
              author{
                username
              }
              title
              caption
              tags{
                id
                tag_name
              }
              post_content
              created_at
              numLikes
            }
          }`,
    delete: `mutation ($id: Int!){
              deletePost(id: $id)
          }`,
    update: `mutation ($input: PostDetails, $id: Int!){
            updatePost(id: $id, input: $input){
                id
                user_id
                author{
                    username
                }
                title
                caption
                post_content
                last_updated
                numLikes
            }
        }`,
    withComments: {
      bare: `query ($post_id: Int!){
        post(id: $post_id){
          id
          title
          caption
          user_id
          author{
              username
          }
          post_content
          created_at
          last_updated
          numLikes
          likers{ username }
          numComments
          comments{
            id
            user_id
            commenter{
              id
              username
            }
            post_id
            comment_text
            numLikes
            likers{ username }
            created_at
            last_updated
          }
        }
      }`,
      andReplies: `query ($post_id: Int!){
        post(id: $post_id){
          id
          title
          caption
          user_id
          author{
              username
          }
          post_content
          created_at
          last_updated
          numLikes
          likers{ username }
          numComments
          comments{
            id
            user_id
            commenter{
              id
              username
            }
            post_id
            comment_text
            numLikes
            likers{ username }
            created_at
            last_updated
            numReplies
            replies{
              id
              user_id
              replier{
                username
              }
              comment_id
              reply_text
              created_at
              last_updated
            }
          }
        }
      }`,
      andCommentTags: `query ($post_id: Int!){
        post(id: $post_id){
          id
          title
          caption
          user_id
          author{
              username
          }
          post_content
          created_at
          last_updated
          numLikes
          likers{ username }
          numComments
          comments{
            id
            user_id
            commenter{
              id
              username
            }
            post_id
            comment_text
            numLikes
            likers{ username }
            created_at
            last_updated
            tags{
              id
              tag_name
            }
          }
        }
      }`
    },
    withTags: `query ($id: Int!){
      post(id: $id){
          id
          title
          caption
          user_id
          author{
              username
          }
          tags{
            id
            tag_name
          }
          post_content
          created_at
          last_updated
          numLikes
      }
    }`
  },
  likes: {
    add: `mutation($post_id: Int!){
      addLike(post_id:$post_id)
    }`,
    delete: `mutation($post_id: Int!){
      deleteLike(post_id:$post_id)
    }`
  },
  comments: {
    create: `mutation($post_id: Int!, $comment_text: String!){
      createComment(post_id: $post_id, comment_text: $comment_text){
            id
            user_id
            commenter{
              id
              username
            }
            post_id
            comment_text
            numLikes
            created_at
            last_updated
      }
    }`,
    update: `mutation($comment_id: Int!, $comment_text: String!, $post_id: Int!){
      updateComment(post_id: $post_id, comment_text: $comment_text, comment_id: $comment_id){
        id
        user_id
        
        commenter{
          id
          username
        }
        post_id
        comment_text
        numLikes
        created_at
        last_updated
      }
    }`,
    delete: `mutation($comment_id: Int!, $post_id: Int!){
      deleteComment(post_id: $post_id, comment_id: $comment_id){
        id
        user_id
        commenter{
          id
          username
        }
        post_id
        comment_text
        numLikes
        created_at
        last_updated
      }
    }`,
    likes: {
      add: `mutation($comment_id: Int!){
        addCommentLike(comment_id: $comment_id)
      }`,
      delete: `mutation($comment_id: Int!){
        deleteCommentLike(comment_id: $comment_id)
      }`
    }
  },
  replies: {
    create: `mutation($comment_id: Int!, $reply_text: String!){
      createReply(comment_id: $comment_id, reply_text: $reply_text){
        id
        user_id
        replier{
          username
        }
        comment_id
        reply_text
        created_at
        last_updated
      }      
    }`,
    delete: `mutation($reply_id: Int!, $comment_id: Int!){
      deleteReply(reply_id: $reply_id, comment_id: $comment_id){
        id
        user_id
        replier{
          username
        }
        comment_id
        reply_text
        created_at
        last_updated
      }
    }`,
    update: `mutation($reply_id: Int!, $comment_id: Int!, $reply_text: String!){
      updateReply(reply_id: $reply_id, comment_id: $comment_id, reply_text: $reply_text){
        id
        user_id
        replier{
          username
        }
        comment_id
        reply_text
        created_at
        last_updated
      }
    }`
  },
  tags: {
    all: `query($search: String, $limit: Int){
      tags(search: $search, limit: $limit){
        id
        tag_name
        created_at
      }
    }`,
    byId: `query($id: Int!){
      tag(id: $id){
        id
        tag_name
        created_at
      }
    }`,
    createPostTags: `mutation($post_id: Int!, $tags:[String]!){
      addPostTags(post_id: $post_id, tags: $tags){
        id
        tag_name
        created_at
      }
    }`
  }

}