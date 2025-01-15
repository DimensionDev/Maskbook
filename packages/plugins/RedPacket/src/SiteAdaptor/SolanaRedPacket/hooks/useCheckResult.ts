import type { Cluster } from '@solana/web3.js'
import { useCallback } from 'react'
import { getRpProgram } from '../../helpers/getRpProgram.js'

interface CheckResultOptions {
    cluster: Cluster
    accountId: string
    account: string
}

export function useCheckResult() {
    return useCallback(async ({ cluster, accountId, account }: CheckResultOptions) => {
        const program = await getRpProgram(cluster)
        const data = await program.account.redPacket.fetch(accountId, 'confirmed')
        const userIndex = data.claimedUsers.findIndex((claimedKey) => claimedKey.toBase58() === account)
        const records = data.claimedAmountRecords
        const rawAmount = userIndex !== -1 && userIndex < records.length ? records[userIndex]?.toString() : ''
        return rawAmount || '0'
    }, [])
}
