import type { Market } from '../types'

export async function fetchMarketBySlug(graph_url: string | undefined, slug: string): Promise<Market | undefined> {
    if (!graph_url) return

    const body = {
        operationName: 'MarketBySlug',
        query: `query MarketBySlug($slug: String) {
            markets(where: {slug: $slug, invalid: false}) {
              ...marketFields
              __typename
            }
          }

          fragment marketFields on Market {
            affiliateAddress
            affiliateCut
            approved
            artistAddress
            artistCut
            artistLink
            cardAffiliateAddresses
            cardAffiliateCut
            cards {
              id
              image
              outcomeName
              price
              marketCardIndex
              longestOwner {
                id
                __typename
              }
              originalNft {
                owner {
                    id
                }
              }
              __typename
            }
            category
            creatorCut
            description
            factory {
              id
              __typename
            }
            id
            invalid
            ipfsHash
            marketCreatorAddress
            minimumPriceIncreasePercent
            minRentalDayDivisor
            mode
            name
            nftMintCount
            numberOfTokens
            giveawayText
            lockingTime
            oracleResolutionTime
            openingTime
            questionId
            remainingCut
            rents {
              id
              __typename
            }
            restrictedRegions
            slug
            sponsorAmount
            sponsors {
              id
              __typename
            }
            state
            sumOfAllPrices
            totalCollected
            totalCollectedTimestampSet
            winningOutcome {
              id
              __typename
            }
            description
            winnerCut
            version
            payouts @skip(if: $withInvalidMarkets) {
              id
              amount
              paid
              __typename
            }
            payouts(where: {type: "rent-paid", account: $accountId}) @include(if: $withInvalidMarkets) {
              id
              __typename
            }
            __typename
          }`,
        variables: { slug },
    }
    const response = await fetch(graph_url, {
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })
    const market = (await response.json())?.data?.markets?.[0]
    return market
}
