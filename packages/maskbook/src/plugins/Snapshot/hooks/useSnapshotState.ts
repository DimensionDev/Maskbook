import { JsonRpcProvider } from '@ethersproject/providers'
import { createContainer } from 'unstated-next'
import { useBlockie } from '../../../web3/hooks/useBlockie'
import { useChainId, useBlockNumber } from '../../../web3/hooks/useChainState'
import { getConstant } from '../../../web3/helpers'
import { CONSTANTS } from '../../../web3/constants'
import type { ProposalIdentifier, ProposalMessage } from '../types'
import { useSnapshot } from './useSnapshot'
// import ss from '@zhouhancheng/snapshot.js'
// import { useAsyncRetry } from 'react-use'

export const SnapshotState = createContainer(useSnapshotState)

export function useSnapshotState(identifier?: ProposalIdentifier) {
    const snapshotAsync = useSnapshot(identifier)
    //#region scores
    // const scoresAsync = useAsyncRetry(async () => {
    //     if (!proposalAsync.value || !votesAsync.value) return null

    //     const spaceKey = message.space
    //     const strategies = message.payload.metadata.strategies
    //     const network = chainId.toString()
    //     const provider = new JsonRpcProvider(getConstant(CONSTANTS, 'PROVIDER_ADDRESS_LIST', chainId)[0])
    //     const voters = Object.keys(votesAsync.value)
    //     const snapshot = Number(message.payload.snapshot)
    //     // const blockTag = snapshot > blockNumber ? 'latest' : snapshot
    //     console.log({  spaceKey, strategies, network, provider, voters  })
    //     return ss.utils.getScores(spaceKey, strategies, network, provider, voters)
    // }, [])
    //#endregion

    // console.log('scoresAsync', scoresAsync)

    if (!snapshotAsync.value) return {}
    const message: ProposalMessage = snapshotAsync.value.message
    const proposal = snapshotAsync.value.proposal
    const votes = snapshotAsync.value.votes
    console.log({ proposal, votes })
    return {
        identifier,
        proposal,
        votes,
        message,
    }
}
