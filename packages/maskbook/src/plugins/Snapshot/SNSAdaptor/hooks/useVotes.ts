import { PluginSnapshotRPC } from '../../messages'
import type { VoteItem, ProposalIdentifier } from '../../types'
import { useSuspense } from '../../../../utils/hooks/useSuspense'
import { useProposal } from './useProposal'
import { useBlockNumber } from '@masknet/web3-shared'

const cache = new Map<string, [0, Promise<void>] | [1, VoteItem[]] | [2, Error]>()
export function votesRetry() {
    for (const key of cache.keys()) {
        cache.delete(key)
    }
}
export function useVotes(identifier: ProposalIdentifier) {
    return useSuspense<VoteItem[], [ProposalIdentifier]>(identifier.id, [identifier], cache, Suspender)
}
async function Suspender(identifier: ProposalIdentifier) {
    const blockNumber = useBlockNumber()
    const {
        payload: { message, proposal },
    } = useProposal(identifier.id)

    const voters = proposal.votes.map((v) => v.voter)
    const scores = await PluginSnapshotRPC.getScores(message, voters, blockNumber, proposal.network)

    const profiles = await PluginSnapshotRPC.fetch3BoxProfiles(voters)
    const profileEntries = Object.fromEntries(profiles.map((p) => [p.contract_address, p]))
    return proposal.votes
        .map((v) => {
            return {
                choiceIndex: v.choice,
                choice: message.payload.choices[v.choice - 1],
                address: v.voter,
                authorIpfsHash: v.id,
                balance: scores.reduce((a, b) => a + (b[v.voter.toLowerCase()] ? b[v.voter.toLowerCase()] : 0), 0),
                scores: message.payload.metadata.strategies.map((_strategy, i) => scores[i][v.voter] || 0),
                strategySymbol: message.payload.metadata.strategies[0].params.symbol,
                authorName: profileEntries[v.voter.toLowerCase()]?.name,
                authorAvatar: profileEntries[v.voter.toLowerCase()]?.image,
                timestamp: v.created,
            }
        })
        .sort((a, b) => b.balance - a.balance)
        .filter((v) => v.balance > 0)
}
