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
