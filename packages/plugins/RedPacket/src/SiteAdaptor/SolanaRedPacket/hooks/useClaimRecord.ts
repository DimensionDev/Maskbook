import { useQuery } from '@tanstack/react-query'
import { getRpProgram } from '../../helpers/getRpProgram.js'
import { web3 } from '@coral-xyz/anchor'
import { base58ToBuffer } from '../../helpers/base58ToBuffer.js'
import type { Cluster } from '@solana/web3.js'

export function useClaimRecord(account: string, accountId: string, cluster: Cluster) {
    return useQuery({
        queryKey: ['red-pacet', 'claim-record', account, accountId, cluster],
        queryFn: async () => {
            const program = await getRpProgram(cluster)
            const claimAccount = web3.PublicKey.findProgramAddressSync(
                [Buffer.from('claim_record'), base58ToBuffer(accountId), base58ToBuffer(account)],
                program.programId,
            )[0]
            const record = await program.account.claimRecord.fetch(claimAccount)
            return record
        },
    })
}
