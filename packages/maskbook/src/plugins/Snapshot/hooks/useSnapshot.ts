import { useAsyncRetry } from 'react-use'
import { PluginSnapshotRPC } from '../messages'
import type { ProposalIdentifier, ProposalMessage } from '../types'
import { useChainId, useBlockNumber } from '../../../web3/hooks/useChainState'
import ss from '@zhouhancheng/snapshot.js'

export function useSnapshot(identifier?: ProposalIdentifier) {
    const chainId = useChainId()
    const blockNumber = useBlockNumber(chainId)
    return useAsyncRetry(async () => {
        if (!identifier) return null
        const proposal = await PluginSnapshotRPC.fetchProposal(identifier.id)
        const votes = await PluginSnapshotRPC.fetchAllVotesOfProposal(identifier.id, identifier.space)
        const message: ProposalMessage = JSON.parse(proposal.msg)

        const spaceKey = message.space
        const strategies = message.payload.metadata.strategies
        const network = chainId.toString()
        const provider = ss.utils.getProvider(network)
        const voters = Object.keys(votes)
        const snapshot = Number(message.payload.snapshot)
        const blockTag = snapshot > blockNumber ? 'latest' : snapshot
        console.log({ spaceKey, strategies, network, provider, voters, blockTag })
        const scores = await ss.utils.getScores(spaceKey, strategies, network, provider, voters, blockTag)
        console.log('scores', scores)
        return { proposal, votes, message }
    }, [identifier?.id])
}
