import type { Cluster } from '@solana/web3.js'
import { useCallback } from 'react'
import { getRpProgram } from '../../helpers/getRpProgram.js'
import { web3 } from '@coral-xyz/anchor'
import { base58ToBuffer } from '../../helpers/base58ToBuffer.js'

interface CheckResultOptions {
    cluster: Cluster
    accountId: string
    account: string
}

export function useCheckResult() {
    return useCallback(async ({ cluster, accountId, account }: CheckResultOptions) => {
        const program = await getRpProgram(cluster)
        const claimAccount = web3.PublicKey.findProgramAddressSync(
            [Buffer.from('claim_record'), base58ToBuffer(accountId), base58ToBuffer(account)],
            program.programId,
        )[0]
        const record = await program.account.claimRecord.fetch(claimAccount)
        return record?.amount.toString() || '0'
    }, [])
}
