const gql = require('graphql-tag')

module.exports = gql`
  type Query {
    hello: String
    user(id: Int, username: String): User!
    authenticated: Boolean!
    post(id: Int!): Post
    posts(limit: Int = 3, search: String ): [Post]!
    tags(limit: Int = 100, search: String ): [Tag]!
    tag(id: Int!): Tag!
  }
  type Mutation {
      login (username: String, password: String): Boolean!
      register (username: String, password: String, email: String): Boolean!
      logout: Boolean!
      updateProfile(id: Int, input: ProfileDetails): Boolean!
      createPost(input: PostDetails): Post!
      deletePost(id: Int!): Boolean!
      updatePost(id: Int!, input: PostDetails): Post!
      addLike(post_id: Int!): Boolean!
      deleteLike(post_id: Int!): Boolean!
      createComment(post_id: Int!, comment_text: String!): [Comment]!
      updateComment(comment_id: Int!, comment_text: String!, post_id: Int!): [Comment]!
      deleteComment(comment_id: Int!, post_id: Int!): [Comment]!
      addCommentLike(comment_id: Int!): Boolean!
      deleteCommentLike(comment_id: Int!): Boolean!
      createReply(comment_id: Int!, reply_text: String!): [Reply]!
      deleteReply(reply_id: Int!, comment_id: Int!): [Reply]!
      updateReply(reply_id: Int!, reply_text: String!, comment_id: Int!): [Reply]!
      addPostTags(post_id:Int!, tags: [String]!): [Tag]!
  }
  type User{
      id: Int!
      username: String!
      email: String!
      created_at: String!
      profile(id: Int): Profile!
      posts: [Post]!
  }
  type Profile{
      user_id: Int!
      about: String!
      photo_path: String!
      last_updated: String
  }
  
  type Post{
      id: Int!
      user_id: Int!
      author: User!
      created_at: String!
      last_updated: String
      title: String!
      caption: String!
      post_content: String!
      numLikes: Int!
      numComments: Int!
      comments: [Comment]!
      likers: [Liker]!
      tags: [Tag]!
  }
  type Tag{
      id: Int!
      tag_name: String!
      created_at: String!
  }
  type Comment{
      id: Int!
      user_id: Int!
      commenter: User!
      post_id: Int!
      comment_text: String!
      numLikes: Int!
      likers: [Liker]!
      created_at: String!
      last_updated: String
      replies: [Reply]!
      numReplies: Int!
      tags: [Tag]!
  }
  type Reply{
      id: Int!
      user_id: Int!
      replier: User!
      comment_id: Int!
      reply_text: String!
      created_at: String!
      last_updated: String
  }
  type Liker{
      user_id: Int!,
      username: String!,
      liked_at: String!
  }
  input ProfileDetails {
      about: String
      photo_path: String
  }
  input PostDetails {
      title: String
      caption: String
      post_content: String
      tags: [String]
     
  }


`;