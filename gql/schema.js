const gql = require('graphql-tag')

module.exports = gql`
  type Query {
    hello: String
    user(id: Int, username: String): User!
    authenticated: Boolean!
    post(id: Int): Post
    posts(order: Boolean = true, orderBy: String = "created_at", limit:Int = 3 ): [Post]
  }
  type Mutation {
      login (username: String, password: String): Boolean!
      register (username: String, password: String, email: String): Boolean!
      logout: Boolean!
      updateProfile(id: Int, input: ProfileDetails): Boolean!
      createPost(input: PostDetails): Post
      deletePost(id: Int!): Boolean!
      updatePost(id: Int, input: PostDetails): Post
  }
  type User{
      id: Int
      username: String
      email: String
      created_at: String
      profile(id: Int): Profile
      posts: [Post]
  }
  type Profile{
      user_id: Int
      about: String
      photo_path: String
      last_updated: String
  }
  
  type Post{
      id: Int
      user_id: Int
      author: User
      created_at: String
      last_updated: String
      title: String
      caption: String
      post_content: String
  }
  input ProfileDetails {
      about: String
      photo_path: String
  }
  input PostDetails {
      title: String
      caption: String
      post_content: String
  }

`;