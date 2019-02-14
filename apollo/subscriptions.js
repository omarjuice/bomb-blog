import gql from "graphql-tag";

export const NEW_POST = gql`
    subscription newPost{
        newPost{
            id
            title
    }
}
`