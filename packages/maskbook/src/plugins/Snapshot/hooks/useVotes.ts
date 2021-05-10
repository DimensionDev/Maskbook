import { PluginSnapshotRPC } from '../messages'
import type { VoteItemList, ProposalIdentifier, VoteItem } from '../types'
import { useSuspense } from '../../../utils/hooks/useSuspense'
import { useProposal } from './useProposal'
import { useBlockNumber } from '../../../web3/hooks/useBlockNumber'
import { ChainId } from '../../../web3/types'

const cache = new Map<string, [0, Promise<void>] | [1, VoteItemList] | [2, Error]>()
export function votesRetry() {
    for (const key of cache.keys()) {
        cache.delete(key)
    }
}
export function useVotes(identifier: ProposalIdentifier) {
    return useSuspense<VoteItemList, [ProposalIdentifier]>(identifier.id, [identifier], cache, Suspender)
}
async function Suspender(identifier: ProposalIdentifier) {
    const blockNumber = useBlockNumber(ChainId.Mainnet)
    const {
        payload: { message },
    } = useProposal(identifier.id)

    const rawVotes = await PluginSnapshotRPC.fetchAllVotesOfProposal(identifier.id, identifier.space)
    const voters = Object.keys(rawVotes)
    const scores = await PluginSnapshotRPC.getScores(message, voters, blockNumber)
    const profiles = await PluginSnapshotRPC.fetch3BoxProfiles(voters)
    const profileEntries = Object.fromEntries(profiles.map((p) => [p.eth_address, p]))

    const votes = Object.fromEntries(
        Object.entries(rawVotes)
            .map((voteEntry: [string, VoteItem]) => {
                voteEntry[1].scores = message.payload.metadata.strategies.map(
                    (_strategy, i) => scores[i][voteEntry[1].address] || 0,
                )
                voteEntry[1].balance = voteEntry[1].scores.reduce((a: number, b: number) => a + b, 0)
                voteEntry[1].choice = message.payload.choices[voteEntry[1].msg.payload.choice - 1]
                voteEntry[1].authorAvatar = profileEntries[voteEntry[0].toLowerCase()]?.image
                voteEntry[1].authorName = profileEntries[voteEntry[0].toLowerCase()]?.name
                return voteEntry
            })
            .sort((a, b) => b[1].balance - a[1].balance)
            .filter((voteEntry) => voteEntry[1].balance > 0),
    )
    return votes
    //#endregion
}
