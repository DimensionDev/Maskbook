import { fetchJSON } from '../../entry-helpers.js'
import type { SnapshotBaseAPI, SnapshotProposal, SnapshotSpace } from '../../entry-types.js'

async function fetchFromGraphql<T>(query: string) {
    const { data } = await fetchJSON<{ data: T }>(
        `https://cors-next.r2d2.to/?https://hub.snapshot.org/graphql?query=${encodeURIComponent(query)}`,
        {
            cache: 'default',
        },
        {
            enableCache: true,
            enableSquash: true,
        },
    )
    return data
}

export class SnapshotAPI implements SnapshotBaseAPI.Provider {
    async getProposalListBySpace(spaceId: string, strategyName?: string): Promise<SnapshotProposal[]> {
        const queryProposal = `
            query {
                proposals (
                    first: 1000,
                    skip: 0,
                    where: {
                        space_in: ["${spaceId}"],
                        state: "all"
                    },
                    orderBy: "created",
                    orderDirection: desc
                ) {
                id
                title
                body
                choices
                start
                end
                snapshot
                state
                scores
                votes
                scores_state
                strategies {
                    network
                    params
                }
                scores_by_strategy
                scores_total
                scores_updated
                author
                space {
                    id
                    name
                }
                }
            }
        `

        const { proposals } = await fetchFromGraphql<{ proposals: SnapshotProposal[] }>(queryProposal)

        return proposals.map((proposal) => {
            const validStrategy = proposal.strategies.find((x) => {
                return !x.params.symbol?.includes('delegated')
            })

            const choicesWithScore = proposal.choices
                .map((x, i) => ({
                    choice: x,
                    score: proposal.scores[i],
                }))
                .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

            return {
                ...proposal,
                strategyName: validStrategy?.params.symbol ?? strategyName ?? proposal.space?.name,
                choicesWithScore,
            }
        })
    }

    async getSpace(spaceId: string) {
        const querySpace = `
            query {
                space(id: "${spaceId}") {
                    members
                    symbol
                    followersCount
                }
            }
        `

        const { space } = await fetchFromGraphql<{ space: SnapshotSpace }>(querySpace)

        return space
    }

    async getCurrentAccountVote(proposalId: string, totalVotes: number, account: string) {
        const allSettled = await Promise.allSettled(
            Array.from(Array(Math.ceil(totalVotes / 1000))).map(async (x, i) => {
                const queryCurrentAccountVote = `
                    query {
                        votes (
                            first: 1000
                            skip: ${i * 1000}
                            where: {
                                proposal: "${proposalId}",
                                voter:"${account}"
                            }
                            orderBy: "created",
                            orderDirection: desc
                        ) {
                            choice
                        }
                    }
                `

                const { votes } = await fetchFromGraphql<{ votes: Array<{ choice: number }> }>(queryCurrentAccountVote)

                return votes[0]
            }),
        )

        const result = allSettled
            .flatMap((x) => (x.status === 'fulfilled' ? x.value : undefined))
            .filter(Boolean) as Array<{ choice: number }>

        return result.length ? result[0] : undefined
    }

    async getFollowingSpaceIdList(account: string) {
        if (!account) return []

        const query = `
            query {
                follows(
                    first: 1000,
                    where: {
                        follower: "${account}"
                    }
                ) {
                    space {
                        id
                    }
                }
            }
        `

        const { follows } = await fetchFromGraphql<{ follows: Array<{ space: { id: string } }> }>(query)

        return follows.map((x) => x.space.id)
    }
}
