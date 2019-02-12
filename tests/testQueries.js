module.exports = {
  login: {
    success: [`
        mutation{
            login(username:"alpha", password:"1")
          }
        `, `
        mutation{
            login(username:"beta", password:"2")
          }
        `,
      `
        mutation{
            login(username:"gamma", password:"3")
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
    all: `query($input: Search!){
      users(input: $input){
        cursor
        results{
          id username
        }
      }
    }`,
    byId: `query($id: Int){
            user(id: $id){
              id
              username
              email
              followers{
                id
                username
                followed_at
              }
              following{
                id
                username
                followed_at
              }
              numFollowers
              numFollowing
              tags{
                id
                tag_name
              }
              created_at
            }
          }`,

  },
  authenticate: `query { authenticated }`,
  register: `mutation($input: Register!){
    register(input: $input)
  }`,
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
            updateProfile(input: $input){
              user_id
              about
              photo_path
              last_updated
            }
      }`
  },
  posts: {
    all: `query ($input: Search!){
            posts(input: $input){
                  cursor
                  results{
                    id
                    user_id
                    title
                    caption
                    created_at
                    author{
                      username
                    }
                    numLikes
                    image
                  }
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
                  image
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
                tags{
                  id
                  tag_name
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
      likePost(post_id:$post_id)
    }`,
    delete: `mutation($post_id: Int!){
      unlikePost(post_id:$post_id)
    }`,
    getUserLikes: `query($id: Int){
      user(id:$id){
        id
        likedPosts{
          id
          title
        }
      }
    }`,
    myLikes: `query($input: Search!){
      posts(input: $input){
        cursor
        results{
          id
          iLike
          comments{
          id
          iLike
        }
        }
      }
    }`
  },
  comments: {
    byId: `query($id: Int!){
      comment(id: $id){
        id
        comment_text
        replies{
          id
          reply_text
        }
      }
    }`,
    create: `mutation($post_id: Int!, $comment_text: String!, $tags: [String]){
      createComment(post_id: $post_id, comment_text: $comment_text, tags: $tags){
            id
            user_id
            commenter{
              id
              username
            }
            post_id
            tags{
              id 
              tag_name
            }
            comment_text
            numLikes
            created_at
            last_updated
      }
    }`,
    update: `mutation($comment_id: Int!, $comment_text: String!, $modTags: ModTags){
      updateComment(comment_text: $comment_text, comment_id: $comment_id, modTags: $modTags){
        id
        user_id
        commenter{
          id
          username
        }
        tags{
          id
          tag_name
        }
        post_id
        comment_text
        numLikes
        created_at
        last_updated
      }
    }`,
    delete: `mutation($comment_id: Int!){
      deleteComment(comment_id: $comment_id)
    }`,
    likes: {
      add: `mutation($comment_id: Int!){
        likeComment(comment_id: $comment_id)
      }`,
      delete: `mutation($comment_id: Int!){
        unlikeComment(comment_id: $comment_id)
      }`
    },
    search: `query($input: Search!){
      comments(input: $input){
        cursor
        results{
          id
        }
      }
    }`
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
    delete: `mutation($reply_id: Int!){
      deleteReply(reply_id: $reply_id)
    }`,
    update: `mutation($reply_id: Int!, $reply_text: String!){
      updateReply(reply_id: $reply_id, reply_text: $reply_text){
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
    all: `query($input: Search! ){
      tags(input: $input){
        cursor
        results{
          id
        tag_name
        created_at
        }
      }
    }`,
    byId: `query($id: Int!){
      tag(id: $id){
        id
        tag_name
        created_at
      }
    }`,
    byIdWithAssociations: `query($id: Int!){
      tag(id: $id){
        id
        tag_name
        created_at
      
      users{
        id
        username
        email
        created_at
      }
      posts{
        id
        title
        caption
        user_id     
        post_content
        created_at
        last_updated
      }
      comments{
        id
        comment_text
        user_id
        post_id
        created_at
        last_updated
      }
    }
  }`

  },
  follows: {
    create: `mutation($user_id: Int!){
      createFollow(user_id: $user_id)
    }`,
    delete: `mutation($user_id: Int!){
      deleteFollow(user_id: $user_id)
    }`,
    getFollowBools: `query($input: Search!){
      users(input: $input){
       cursor
       results{
        id
        imFollowing
        followingMe
       }
      }
    }`
  }

}