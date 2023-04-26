import { fetchJSON } from '../../entry-helpers.js'
import type { SnapshotBaseAPI, SnapshotProposal, SnapshotSpace } from '../../entry-types.js'

async function fetchFromGraphql<T>(query: string) {
    const { data } = await fetchJSON<{ data: T }>(
        `https://cors-next.r2d2.to/?https://hub.snapshot.org/graphql?query=${encodeURIComponent(query)}`,
    )
    return data
}

export class SnapshotAPI implements SnapshotBaseAPI.Provider {
    async getProposalListBySpace(spaceId: string): Promise<SnapshotProposal[]> {
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
                return !x.params.symbol.includes('delegated')
            })

            const choicesWithScore = proposal.choices
                .map((x, i) => ({
                    choice: x,
                    score: proposal.scores[i],
                }))
                .sort((a, b) => b.score - a.score)

            return { ...proposal, strategyName: validStrategy?.params.symbol ?? proposal.space.name, choicesWithScore }
        })
    }

    async getSpace(spaceId: string) {
        const querySpace = `
            query {
                space(id: "${spaceId}") {
                    members
                    followersCount
                }
            }
        `

        const { space } = await fetchFromGraphql<{ space: SnapshotSpace }>(querySpace)

        return space
    }
}
