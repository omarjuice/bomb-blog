const gql = require('graphql-tag')

module.exports = gql`
  type Query {
    hello: String
    user(id: Int, username: String): User!
    users(limit: Int = 3, search: String, order: Boolean, orderBy: String): [User]!
    authenticated: Boolean!
    post(id: Int!): Post
    posts(limit: Int = 3, search: String, order: Boolean, orderBy: String ): [Post]!
    tag(id: Int!): Tag!
    tags(limit: Int = 100, search: String, order: Boolean, orderBy: String ): [Tag]!
    comment(id: Int!): Comment
  }
  type Mutation {
      login (username: String, password: String): Boolean!
      register (input: Register!): Boolean!
      logout: Boolean!
      updateProfile(id: Int, input: ProfileDetails): Profile
      createPost(input: PostDetails): Post!
      deletePost(id: Int!): Boolean!
      updatePost(id: Int!, input: PostDetails): Post!
      likePost(post_id: Int!): Boolean!
      unlikePost(post_id: Int!): Boolean!
      createComment(post_id: Int!, comment_text: String!, tags: [String]): Comment!
      updateComment(comment_id: Int!, comment_text: String!, modTags: ModTags): Comment!
      deleteComment(comment_id: Int!): Boolean!
      likeComment(comment_id: Int!): Boolean!
      unlikeComment(comment_id: Int!): Boolean!
      createReply(comment_id: Int!, reply_text: String!): Reply!
      deleteReply(reply_id: Int!): Boolean!
      updateReply(reply_id: Int!, reply_text: String!): Reply!
      createFollow(user_id: Int!): Boolean!
      deleteFollow(user_id: Int!): Boolean!
  }
  type User{
      id: Int!
      followers: [Follower]!
      following: [Follower]!
      numFollowers: Int!
      numFollowing: Int!
      username: String!
      email: String!
      created_at: String!
      profile(id: Int): Profile!
      posts: [Post]!
      tags: [Tag]!
      likedPosts: [Post]!
      isMe: Boolean!
      imFollowing: Boolean!
      followingMe: Boolean!
  }
  type Profile{
      user_id: Int!
      user: User
      about: String
      photo_path: String
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
      iLike: Boolean!
  }
  type Tag{
      id: Int!
      tag_name: String!
      created_at: String!
      users: [User]!
      posts: [Post]!
      comments: [Comment]!
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
      iLike: Boolean!
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
      id: Int!
      username: String!
      profile: Profile!
      liked_at: String!
      imFollowing: Boolean!
      followingMe: Boolean!
      isMe: Boolean!
  }
  type Follower{
      id: Int!
      username: String!
      followed_at: String!
      followingMe: Boolean!
      imFollowing: Boolean!
      isMe: Boolean!
      profile: Profile!
  }
  input ProfileDetails {
      about: String
      photo_path: String
      modTags: ModTags
  }
  input PostDetails {
      title: String
      caption: String
      post_content: String
      tags: [String]
      modTags: ModTags
  }
  input ModTags {
    addTags: [String]!
    deleteTags: [String]! 
  }
  input Register{
    username: String! 
    password: String!
    email: String!
  }

`;