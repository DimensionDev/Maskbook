import { useAsyncRetry } from 'react-use'
import { useAccount, useBlockNumber } from '@masknet/web3-shared'
import { PluginSnapshotRPC } from '../../messages'
import type { ProposalIdentifier } from '../../types'
import { useProposal } from './useProposal'
import { mapKeys } from 'lodash-es'

export function usePower(identifier: ProposalIdentifier) {
    const {
        payload: { message, proposal },
    } = useProposal(identifier.id)

    const account = useAccount()
    const blockNumber = useBlockNumber()
    return useAsyncRetry(async () => {
        if (!account) return 0
        return (
            await PluginSnapshotRPC.getScores(
                message,
                [account],
                blockNumber,
                proposal.network,
                identifier.space,
                proposal.strategies,
            )
        )
            .map((v) => mapKeys(v, (_value, key) => key.toLowerCase()) as { [x: string]: number })
            .reduce((acc, cur) => {
                return acc + cur[account.toLowerCase()]
            }, 0)
    }, [blockNumber, account])
}
