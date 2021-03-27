import { request, gql } from 'graphql-request'
import { SUBGRAPH_URI } from './constants'
import type { getListingData } from './types'
import type { getAllListingsData } from './types'

const createQuery = (name: string) => {
    const query = gql`
    {
        ideaTokens(where: { name: "${name}" }) {
          rank
          dayChange
	  latestPricePoint {
	    price
	  }
        }
    }`
    return query
}

export async function getListing(username: string): Promise<getListingData> {
    const result = await request(SUBGRAPH_URI, createQuery(username))

    return {
        rank: result!.ideaTokens[0]!.rank,
        dayChange: result!.ideaTokens[0]!.dayChange,
        price: result!.ideaTokens[0]!.latestPricePoint!.price,
    }
}

const allListings = gql`
    {
        ideaTokens {
            name
            rank
            dayChange
            latestPricePoint {
                price
            }
        }
    }
`

interface returnedObject {
    ideaTokens: getAllListingsData[]
}

export async function getAllListings(): Promise<returnedObject> {
    const result: returnedObject = await request(SUBGRAPH_URI, allListings)

    return result
}
