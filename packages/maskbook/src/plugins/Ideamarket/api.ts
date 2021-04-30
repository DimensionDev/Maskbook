import { SUBGRAPH_URI } from './constants'
import { HttpLink, gql, ApolloClient, InMemoryCache } from '@apollo/client'
import type { GetListingData } from './types'

const link = new HttpLink({ uri: SUBGRAPH_URI, useGETForQueries: true })

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: link,
})

const createQuery = (name: string) => {
    const query = gql`
    {
        ideaMarkets(where:{name:"Twitter"}) {
            tokens(where:{name:"${name}"}) {
                rank
                dayChange
	            latestPricePoint {
	                price
	            }
            }
        }
    }`
    return query
}

export async function getListing(username: string): Promise<GetListingData> {
    const result = ((await client.query({ query: createQuery(username) })) as any).data.ideaMarkets[0]
    return {
        rank: result!.tokens[0]!.rank,
        dayChange: result!.tokens[0]!.dayChange,
        price: result!.tokens[0]!.latestPricePoint!.price,
    }
}
