import { BN, web3 } from '@coral-xyz/anchor'
import { ZERO } from '@masknet/web3-shared-base'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import type { Cluster } from '@solana/web3.js'
import { BigNumber } from 'bignumber.js'
import { getRpProgram } from './getRpProgram.js'
import { getSolanaConnection } from './getSolanaProvider.js'
import { getTokenAccount, getTokenProgram } from './getTokenAccount.js'

const MAX_NUM = 200 // Maximum number of red packets (constant)
export async function createWithSplToken(
    creator: web3.PublicKey,
    tokenMint: web3.PublicKey,
    totalNumber: number,
    totalAmount: number,
    duration: number,
    ifSpiltRandom: boolean,
    pubkeyForClaimSignature: web3.PublicKey,
    author: string,
    message: string,
    cluster: Cluster | undefined,
) {
    // Ensure the totalNumber and totalAmount are within the acceptable range
    if (totalNumber > MAX_NUM) {
        throw new Error(`Total number of red packets cannot exceed ${MAX_NUM}`)
    }

    const program = await getRpProgram(cluster)

    const tokenAccount = await getTokenAccount(tokenMint, cluster)
    if (!tokenAccount) throw new Error('Token account not found')

    const tokenProgram = await getTokenProgram(tokenMint, cluster)
    if (!tokenProgram) throw new Error('Token program not found')

    const createTime = Math.floor(Date.now() / 1000)
    const [splTokenRedPacket] = web3.PublicKey.findProgramAddressSync(
        [creator.toBuffer(), Uint8Array.from(new BN(createTime).toArray('le', 8))],
        program.programId,
    )

    const vault = getAssociatedTokenAddressSync(tokenMint, splTokenRedPacket, true, tokenProgram)

    const signature = await program.methods
        .createRedPacketWithSplToken(
            totalNumber,
            new BN(totalAmount),
            new BN(createTime),
            new BN(duration),
            ifSpiltRandom,
            pubkeyForClaimSignature,
            author,
            message,
        )
        .accounts({
            signer: creator,
            // @ts-expect-error missing type
            redPacket: splTokenRedPacket,
            tokenMint,
            tokenAccount,
            vault,
            tokenProgram,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId,
        })
        .rpc({
            commitment: 'confirmed',
        })

    return {
        accountId: splTokenRedPacket,
        signature,
    }
}

export async function getEstimatedGasByCreateWithSplToken(
    creator: web3.PublicKey,
    tokenMint: web3.PublicKey,
    totalNumber: number,
    totalAmount: number,
    duration: number,
    ifSpiltRandom: boolean,
    pubkeyForClaimSignature: web3.PublicKey,
    message: string,
    author: string,
    cluster: Cluster | undefined,
) {
    // Ensure the totalNumber and totalAmount are within the acceptable range
    if (totalNumber > MAX_NUM) {
        throw new Error(`Total number of red packets cannot exceed ${MAX_NUM}`)
    }

    const program = await getRpProgram(cluster)

    const connection = await getSolanaConnection('devnet')

    const tokenAccount = await getTokenAccount(tokenMint, cluster)
    if (!tokenAccount) throw new Error('Token account not found')

    const tokenProgram = await getTokenProgram(tokenMint, cluster)
    if (!tokenProgram) throw new Error('Token program not found')

    const createTime = Math.floor(Date.now() / 1000)
    const [splTokenRedPacket] = web3.PublicKey.findProgramAddressSync(
        [creator.toBuffer(), Buffer.from(new BN(createTime).toArray('le', 8))],
        program.programId,
    )

    const vault = getAssociatedTokenAddressSync(tokenMint, splTokenRedPacket, true, tokenProgram)

    const transaction = await program.methods
        .createRedPacketWithSplToken(
            totalNumber,
            new BN(totalAmount),
            new BN(createTime),
            new BN(duration),
            ifSpiltRandom,
            pubkeyForClaimSignature,
            author,
            message,
        )
        .accounts({
            signer: creator,
            // @ts-expect-error missing type
            redPacket: splTokenRedPacket,
            tokenMint,
            tokenAccount,
            vault,
            tokenProgram,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId,
        })
        .transaction()

    transaction.recentBlockhash = (await connection.getRecentBlockhash('finalized')).blockhash
    transaction.feePayer = creator

    const fee = await transaction.getEstimatedFee(connection)

    return fee ? new BigNumber(fee) : ZERO
}
