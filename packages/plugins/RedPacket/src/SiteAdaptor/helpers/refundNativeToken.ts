import { web3 } from '@coral-xyz/anchor'
import { getRpProgram } from './getRpProgram.js'
import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import type { Cluster } from '@solana/web3.js'

export async function refundNativeToken(id: string, creator: SolanaWeb3.PublicKey, cluster?: Cluster | undefined) {
    const program = await getRpProgram(cluster)
    return program.methods
        .withdrawWithNativeToken()
        .accounts({
            // @ts-expect-error missing type
            redPacket: new SolanaWeb3.PublicKey(id),
            signer: new SolanaWeb3.PublicKey(creator),
            systemProgram: web3.SystemProgram.programId,
        })
        .rpc({
            commitment: 'confirmed',
        })
}
