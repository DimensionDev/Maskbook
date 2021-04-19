import { useAsyncRetry } from 'react-use'
import { PluginSnapshotRPC } from '../messages'
import type { ProposalIdentifier } from '../types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useProposal } from './useProposal'
import { useBlockNumber } from '../../../web3/hooks/useBlockNumber'
import { ChainId } from '../../../web3/types'

export function usePower(identifier: ProposalIdentifier) {
    const {
        payload: { message },
    } = useProposal(identifier.id)

    const blockNumber = useBlockNumber(ChainId.Mainnet)
    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!account) return 0
        const scores = await PluginSnapshotRPC.getScores(message, [account], blockNumber)
        return scores[0]![account]!
    }, [blockNumber, account])
}
