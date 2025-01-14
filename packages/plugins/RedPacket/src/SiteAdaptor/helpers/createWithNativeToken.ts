import { BN, web3 } from '@coral-xyz/anchor'
import { getRpProgram } from './getRpProgram.js'
import { getSolanaConnection } from './getSolanaProvider.js'
import { BigNumber } from 'bignumber.js'
import { ZERO } from '@masknet/web3-shared-base'

const MAX_NUM = 1000 // Maximum number of red packets (constant)
const MAX_AMOUNT = 1000000000 // Maximum amount of red packets (constant)

// Function to create a red packet with native tokens
export async function createWithNativeToken(
    creator: web3.PublicKey, // This would be the user sending the transaction
    totalNumber: number, // Total number of red packets
    totalAmount: number, // Total amount in lamports (1 SOL = 10^9 lamports)
    duration: number, // in seconds
    ifSpiltRandom: boolean, // Whether to split randomly
    pubkeyForClaimSignature: web3.PublicKey, // Public key to be used for claim signature
    message: string, // Message to be included in the red packet
    author: string, // Author of the red packet
) {
    // Ensure the totalNumber and totalAmount are within the acceptable range
    if (totalNumber > MAX_NUM) {
        throw new Error(`Total number of red packets cannot exceed ${MAX_NUM}`)
    }
    if (totalAmount > MAX_AMOUNT) {
        throw new Error(`Total amount of red packets cannot exceed ${MAX_AMOUNT}`)
    }

    const program = await getRpProgram()

    const createTime = Math.floor(Date.now() / 1000)
    const nativeTokenRedPacket = web3.PublicKey.findProgramAddressSync(
        [creator.toBuffer(), Uint8Array.from(new BN(createTime).toArray('le', 8))],
        program.programId,
    )[0]

    console.log('DEBUG: createRedPacketWithNativeToken')
    console.log({
        totalNumber,
        totalAmount,
        createTime,
        duration,
        ifSpiltRandom,
        pubkeyForClaimSignature: pubkeyForClaimSignature.toBase58(),
        nativeTokenRedPacket: nativeTokenRedPacket.toBase58(),
        programId: program.programId.toBase58(),
        system: web3.SystemProgram.programId.toBase58(),
    })

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

    console.log('The transaction signature is:', signature)

    const rp = await program.account.redPacket.fetch(nativeTokenRedPacket)

    console.log('DEBUG: rp')
    console.log(rp)

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
): Promise<BigNumber> {
    const program = await getRpProgram()
    const createTime = Math.floor(Date.now() / 1000)
    const connection = await getSolanaConnection()

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
