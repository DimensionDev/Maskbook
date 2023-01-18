import { PluginSnapshotRPC } from '../../messages.js'
import type { ProposalIdentifier, VoteItem } from '../../types.js'
import { cache, use } from 'react'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useProposal } from './useProposal.js'
import { sumBy } from 'lodash-es'

const Request = cache(Suspender)
export function useVotes(identifier: ProposalIdentifier, account?: string) {
    return use(Request(identifier.id, identifier.space, account))
}
async function Suspender(id: ProposalIdentifier['id'], space: ProposalIdentifier['space'], account?: string) {
    const proposal = useProposal(id)

    const voters = proposal.votes.map((v) => v.voter)
    const scores = await PluginSnapshotRPC.getScores(
        proposal.snapshot,
        voters,
        proposal.network,
        space,
        proposal.strategies,
    )
    const strategies = proposal.strategies
    return proposal.votes
        .map((v): VoteItem => {
            const choices =
                typeof v.choice === 'number'
                    ? undefined
                    : Array.isArray(v.choice)
                    ? v.choice.map((i) => ({
                          weight: 1,
                          name: proposal.choices[i - 1],
                          index: Number(i),
                      }))
                    : Object.entries(v.choice).map(([i, weight]) => ({
                          weight,
                          name: proposal.choices[Number(i) - 1],
                          index: Number(i),
                      }))
            return {
                choiceIndex: typeof v.choice === 'number' ? v.choice : undefined,
                choiceIndexes: typeof v.choice === 'number' ? undefined : Object.keys(v.choice).map((i) => Number(i)),
                choice: typeof v.choice === 'number' ? proposal.choices[v.choice - 1] : undefined,
                choices,
                totalWeight: choices
                    ? Array.isArray(v.choice)
                        ? v.choice.length
                        : sumBy(choices, (choice) => choice.weight)
                    : undefined,
                address: v.voter,
                authorIpfsHash: v.ipfs ?? v.id,
                balance: sumBy(scores, (score) => score[v.voter.toLowerCase()] ?? 0),
                scores: strategies.map((_strategy, i) => scores[i][v.voter] || 0),
                strategySymbol: proposal.space.symbol ?? strategies[0].params.symbol,
                timestamp: v.created,
            }
        })
        .sort((a, b) => (isSameAddress(a.address, account) ? -1 : b.balance - a.balance))
        .filter((v) => v.balance > 0)
}
