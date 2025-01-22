import { BN, web3 } from '@coral-xyz/anchor'
import { ZERO } from '@masknet/web3-shared-base'
import type { Cluster } from '@solana/web3.js'
import { BigNumber } from 'bignumber.js'
import { getRpProgram } from './getRpProgram.js'
import { getSolanaConnection } from './getSolanaProvider.js'

const MAX_NUM = 200 // Maximum number of red packets (constant)

// Function to create a red packet with native tokens
export async function createWithNativeToken(
    creator: web3.PublicKey, // This would be the user sending the transaction
    totalNumber: number, // Total number of red packets
    totalAmount: number, // Total amount in lamports (1 SOL = 10^9 lamports)
    duration: number, // in seconds
    ifSpiltRandom: boolean, // Whether to split randomly
    pubkeyForClaimSignature: web3.PublicKey, // Public key to be used for claim signature
    author: string, // Author of the red packet
    message: string, // Message to be included in the red packet
    cluster: Cluster | undefined,
) {
    // Ensure the totalNumber and totalAmount are within the acceptable range
    if (totalNumber > MAX_NUM) {
        throw new Error(`Total number of red packets cannot exceed ${MAX_NUM}`)
    }

    const program = await getRpProgram(cluster)

    const createTime = Math.floor(Date.now() / 1000)
    const nativeTokenRedPacket = web3.PublicKey.findProgramAddressSync(
        [creator.toBuffer(), Uint8Array.from(new BN(createTime).toArray('le', 8))],
        program.programId,
    )[0]

    const signature = await program.methods
        .createRedPacketWithNativeToken(
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
        })
        .rpc({
            commitment: 'confirmed',
            // @ts-expect-error missing type
            redPacket: nativeTokenRedPacket,
            systemProgram: web3.SystemProgram.programId,
        })

    return {
        accountId: nativeTokenRedPacket,
        signature,
    }
}

export async function getEstimatedGasByCreateWithNativeToken(
    creator: web3.PublicKey,
    totalNumber: number,
    totalAmount: number,
    duration: number,
    ifSpiltRandom: boolean,
    pubkeyForClaimSignature: web3.PublicKey,
    message: string,
    author: string,
    cluster: Cluster | undefined,
): Promise<BigNumber> {
    const program = await getRpProgram(cluster)
    const createTime = Math.floor(Date.now() / 1000)
    const connection = await getSolanaConnection(cluster)

    const transaction = await program.methods
        .createRedPacketWithNativeToken(
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
        })
        .transaction()

    transaction.recentBlockhash = (await connection.getRecentBlockhash('finalized')).blockhash
    transaction.feePayer = creator

    const fee = await transaction.getEstimatedFee(connection)

    return fee ? new BigNumber(fee) : ZERO
}
