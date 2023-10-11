import type { DAOResult } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export namespace SnapshotBaseAPI {
    export interface SnapshotProposal {
        id: string
        title: string
        body: string
        author: string
        start: number
        end: number
        dateDescription: string
        choices: string[]
        scores_total: number
        state: string
        scores: number[]
        strategies: Array<{ params: { symbol?: string } }>
        strategyName: string
        space: {
            id: string
            name: string
        }
        votes: number
        choicesWithScore: Array<{ score: number; choice: string }>
    }

    export interface SnapshotSpace {
        members: string[]
        symbol: string
        followersCount: number
    }

    export interface DataSourceProvider {
        get(): Promise<Array<DAOResult<ChainId.Mainnet>>>
    }
}
