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
        all: `query ($limit: Int, $order: Boolean, $orderBy: String){
            posts(limit: $limit, order: $order, orderBy: $orderBy){
                  id
                  user_id
                  title
                  caption
                  created_at
                  author{
                    username
                  }
            }
          }`,
        byId: `query ($id: Int){
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
              post_content
              created_at
            }
          }`,
        delete: `mutation ($id: Int!){
              deletePost(id: $id)
          }`,
        update: `mutation ($input: PostDetails, $id: Int){
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
            }
        }`

    }
}