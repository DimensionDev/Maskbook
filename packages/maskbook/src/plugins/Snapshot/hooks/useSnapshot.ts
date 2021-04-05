import { createContainer } from 'unstated-next'
import { useAsyncRetry } from 'react-use'
import { PluginSnapshotRPC } from '../messages'
import type { ProposalIdentifier, ProposalMessage, Vote, Votes, ProposalResult } from '../types'
import { useChainId, useBlockNumber } from '../../../web3/hooks/useChainState'
import ss from '@snapshot-labs/snapshot.js'

export const SnapshotState = createContainer(useSnapshot)

export function useSnapshot(identifier?: ProposalIdentifier) {
    const chainId = useChainId()
    const blockNumber = useBlockNumber(chainId)
    return useAsyncRetry(async () => {
        if (!identifier) return null
        const proposal = await PluginSnapshotRPC.fetchProposal(identifier.id)
        const votesWithoutScores = await PluginSnapshotRPC.fetchAllVotesOfProposal(identifier.id, identifier.space)
        const message: ProposalMessage = JSON.parse(proposal.msg)

        //#region get scores
        const spaceKey = message.space
        const strategies = message.payload.metadata.strategies
        const network = chainId.toString()
        const provider = ss.utils.getProvider(network)
        const voters = Object.keys(votesWithoutScores)
        const snapshot = Number(message.payload.snapshot)
        const blockTag = snapshot > blockNumber ? 'latest' : snapshot
        console.log({ spaceKey, strategies, network, provider, voters, blockTag, votesWithoutScores })
        const scores = await ss.utils.getScores(spaceKey, strategies, network, provider, voters, blockTag)
        //#endregion

        //#region get balance and scores of votes
        const votes = Object.fromEntries(
            Object.entries(votesWithoutScores)
                .map((voteEntry: [string, Vote]) => {
                    voteEntry[1].scores = strategies.map((_strategy, i) => scores[i][voteEntry[1].address] || 0)
                    voteEntry[1].balance = voteEntry[1].scores.reduce((a: number, b: number) => a + b, 0)
                    return voteEntry
                })
                .sort((a, b) => b[1].balance - a[1].balance)
                .filter((voteEntry) => voteEntry[1].balance > 0),
        )
        //#endregion

        //#region get proposal results
        const results: ProposalResult = {
            voteNumberOfChoices: message.payload.choices.map((_choice, i) => voteForChoice(votes, i).length),
            powerOfChoices: message.payload.choices.map((_choice, i) =>
                voteForChoice(votes, i).reduce((a, b) => a + b.balance, 0),
            ),
            powerDetailOfChoices: message.payload.choices.map((_choice, i) =>
                strategies.map((_strategy, sI) => voteForChoice(votes, i).reduce((a, b) => a + b.scores[sI], 0)),
            ),
            totalPower: Object.values(votes).reduce((a, b) => a + b.balance, 0),
        }
        //#endregion

        console.log({ results })

        return { identifier, proposal, votes, message, results }
    }, [identifier?.id])
}

function voteForChoice(votes: Votes, i: number) {
    return Object.values(votes).filter((vote) => vote.msg.payload.choice === i + 1)
}
