import { fetchJSON } from '../../entry-helpers.js'
import type { SnapshotBaseAPI, SnapshotProposal } from '../../entry-types.js'

async function fetchFromGraphql<T>(query: string) {
    const { data } = await fetchJSON<{ data: T }>(
        `https://cors-next.r2d2.to/?https://hub.snapshot.org/graphql?query=${encodeURIComponent(query)}`,
    )
    return data
}

export class SnapshotAPI implements SnapshotBaseAPI.Provider {
    async getProposalListBySpace(spaceId: string): Promise<SnapshotProposal[]> {
        const query = `
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
        const { proposals } = await fetchFromGraphql<{ proposals: SnapshotProposal[] }>(query)

        return proposals
    }
}
