import withApollo from 'next-with-apollo'
import client from './client';


export default withApollo(() => client)