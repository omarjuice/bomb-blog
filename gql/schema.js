const gql = require('graphql-tag')

module.exports = gql`
  type Query {
    hello: String
    authenticated: Boolean!
    isAdmin: Boolean!
    user(id: Int, username: String): User
    users(input: Search!): Users!
    post(id: Int!): Post
    posts(input: Search!): Posts!
    tag(id: Int!): Tag!
    tags(input: Search! ): Tags!
    comment(id: Int!): Comment
    comments(input: Search!): Comments!
    notifications: Notifications
    secretQuestion(username: String!): SecretQuestion
  }
  type Mutation {
      login (username: String, password: String): Boolean!
      register (input: Register!): Int!
      createSecret(question: String!, answer: String!): Boolean!
      logout: Boolean!
      updateProfile(id: Int, input: ProfileDetails): Profile
      createPost(input: PostDetails): Post!
      deletePost(id: Int!): Boolean!
      updatePost(id: Int!, input: PostDetails): Post!
      featurePost(id:Int!): Boolean!
      unfeaturePost(id: Int!): Boolean!
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
      uploadImage(image: Upload!, type: String!): String
      passwordReset(id: Int, secretAnswer: String!, newPassword: String!): Boolean!
      setLastRead(lastRead: Int!): Int
  }
  type Subscription{
      newPost(id: Int!): Post
      newComment(id: Int!): Comment
      newFollower(id:Int!): NewFollower
      newLike(id:Int!): NewLike
      newReply(id: Int!): Reply
      newCommentLike(id: Int!): NewCommentLike
      featuredPost(id: Int!): FeaturedPost
      appMessage(id: Int!): AppMessage!
  }
  
  type Notifications{
      lastVisited: Int
      lastRead: Int
      newPosts: [Post]!
      newComments: [Comment]!
      newLikes: [NewLike]!
      newCommentLikes: [NewCommentLike]!
      newReplies: [Reply]!
      newFollowers: [NewFollower]!
      featuredPosts: [FeaturedPost]!
      appMessages: [AppMessage]!
  }
 
  type Users{
      cursor: Int
      results: [User]!
  }
  type Posts{
      cursor: Int
      results: [Post]!
  }
  type Tags{
      cursor: Int
      results: [Tag]!
  }
  type Comments{
      cursor: Int
      results: [Comment]!
  }
  type User{
      id: Int!
      username: String!
      email: String!
      created_at: String!
      privilege: String
      followers: [Follower]!
      following: [Follower]!
      numFollowers: Int!
      numFollowing: Int!
      profile: Profile!
      posts: [Post]!
      tags: [Tag]!
      likedPosts: [Post]!
      isMe: Boolean!
      imFollowing: Boolean!
      followingMe: Boolean!
      followingPosts(cursor: Int = 0, limit: Int=5): Posts!
      relevance: Int
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
      image: String
      featured: Boolean!
      featured_at: String
      numLikes: Int!
      numComments: Int!
      comments: [Comment]!
      likers: [Liker]!
      tags: [Tag]!
      iLike: Boolean!
      relevance: Int
      trending: Float
  }
  type Tag{
      id: Int!
      tag_name: String!
      created_at: String!
      popularity: Int!
      relevance: Int!
      users: [User]!
      posts: [Post]!
      comments: [Comment]!
  }
  type Comment{
      id: Int!
      user_id: Int!
      commenter: User!
      post_id: Int!
      post: Post!
      comment_text: String!
      numLikes: Int!
      likers: [Liker]!
      created_at: String!
      last_updated: String
      replies: [Reply]!
      numReplies: Int!
      tags: [Tag]!
      iLike: Boolean!
      relevance: Int
  }
  type Reply{
      id: Int!
      user_id: Int!
      replier: User!
      comment_id: Int!
      comment: Comment!
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
  type NewCommentLike{
      comment: Comment
      user: User
      liked_at: String 
  }
  type NewLike{
      post: Post
      user: User
      liked_at: String
  }
  type NewFollower{
      user: User
      followed_at: String
      followed_id: Int
  }
  type FeaturedPost{
      post: Post!
      featured_at: String!
  }
  type SecretQuestion{
      id: Int!
      question: String!
  }
  type AppMessage{
      message: String!
      created_at: String!
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
      image: String = null
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
  input Search{
    limit: Int = 3
    cursor: Int = 0
    search: String 
    order: Boolean
    orderBy: String 
    tags:[String]
    exclude: [Int] = [0]
    featured: Boolean
  }
  scalar Upload
`;