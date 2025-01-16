import { web3 } from '@coral-xyz/anchor'
import type { Cluster } from '@solana/web3.js'
import { base58ToBuffer } from './base58ToBuffer.js'
import { getRpProgram } from './getRpProgram.js'

interface CheckResultOptions {
    cluster: Cluster
    accountId: string
    account: string
}
export async function getClaimRecord({ cluster, accountId, account }: CheckResultOptions) {
    const program = await getRpProgram(cluster)
    const claimAccount = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('claim_record'), base58ToBuffer(accountId), base58ToBuffer(account)],
        program.programId,
    )[0]
    return program.account.claimRecord.fetch(claimAccount)
}
