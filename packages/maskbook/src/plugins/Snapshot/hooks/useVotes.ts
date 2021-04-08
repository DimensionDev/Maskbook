import { PluginSnapshotRPC } from '../messages'
import type { Votes, ProposalIdentifier, Vote } from '../types'
import { useSuspense } from '../../../utils/hooks/useSuspense'
import { useProposal } from './useProposal'
import { useChainId, useBlockNumber } from '../../../web3/hooks/useChainState'
import ss from '@snapshot-labs/snapshot.js'

const cache = new Map<string, [0, Promise<void>] | [1, Votes] | [2, Error]>()
export function votesErrorRetry() {
    cache.forEach(([status], id) => status === 2 && cache.delete(id))
}
export function useVotes(identifier: ProposalIdentifier) {
    return useSuspense<Votes, [ProposalIdentifier]>(identifier.id, [identifier], cache, Suspender)
}
async function Suspender(identifier: ProposalIdentifier) {
    const chainId = useChainId()
    const blockNumber = useBlockNumber(chainId)
    const {
        payload: { proposal, message },
    } = useProposal(identifier.id)
    const votesWithoutScores = await PluginSnapshotRPC.fetchAllVotesOfProposal(identifier.id, identifier.space)

    //#region get scores
    const spaceKey = message.space
    const strategies = message.payload.metadata.strategies
    const network = chainId.toString()
    const provider = ss.utils.getProvider(network)
    const voters = Object.keys(votesWithoutScores)
    const snapshot = Number(message.payload.snapshot)
    const blockTag = snapshot > blockNumber ? 'latest' : snapshot
    const scores = await ss.utils.getScores(spaceKey, strategies, network, provider, voters, blockTag)
    //#endregion

    //#region get 3box profile
    const profiles = await PluginSnapshotRPC.fetch3BoxProfiles(voters)
    const profileEntries = Object.fromEntries(profiles.map((p) => [p.eth_address, p]))
    //#endregion

    //#region get power of votes
    const votes = Object.fromEntries(
        Object.entries(votesWithoutScores)
            .map((voteEntry: [string, Vote]) => {
                voteEntry[1].scores = strategies.map((_strategy, i) => scores[i][voteEntry[1].address] || 0)
                voteEntry[1].balance = voteEntry[1].scores.reduce((a: number, b: number) => a + b, 0)
                voteEntry[1].choice = message.payload.choices[voteEntry[1].msg.payload.choice - 1]
                voteEntry[1].authorAvatar = profileEntries[voteEntry[0].toLowerCase()]?.image
                voteEntry[1].authorName = profileEntries[voteEntry[0].toLowerCase()]?.name
                return voteEntry
            })
            .sort((a, b) => b[1].balance - a[1].balance)
            .filter((voteEntry) => voteEntry[1].balance > 0),
    )

    console.log({ votes, profileEntries })
    return votes
    //#endregion
}
