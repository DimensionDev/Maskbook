import { BigNumber } from 'bignumber.js'
import { getRpProgram } from './getRpProgram.js'
import { getSolanaConnection } from './getSolanaProvider.js'
import { getTokenAccount, getTokenProgram } from './getTokenAccount.js'
import { BN, web3 } from '@coral-xyz/anchor'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { ZERO } from '@masknet/web3-shared-base'

const MAX_NUM = 1000 // Maximum number of red packets (constant)
const MAX_AMOUNT = 1000000000 // Maximum amount of red packets (constant)

export async function createWithSplToken(
    creator: web3.PublicKey,
    tokenMint: web3.PublicKey,
    totalNumber: number,
    totalAmount: number,
    duration: number,
    ifSpiltRandom: boolean,
    pubkeyForClaimSignature: web3.PublicKey,
    message: string,
    author: string,
) {
    // Ensure the totalNumber and totalAmount are within the acceptable range
    if (totalNumber > MAX_NUM) {
        throw new Error(`Total number of red packets cannot exceed ${MAX_NUM}`)
    }
    if (totalAmount > MAX_AMOUNT) {
        throw new Error(`Total amount of red packets cannot exceed ${MAX_AMOUNT}`)
    }

    const program = await getRpProgram()

    const tokenAccount = await getTokenAccount(tokenMint)
    if (!tokenAccount) throw new Error('Token account not found')
    console.log('DEBUG: tokenAccount', tokenAccount.toBase58())

    const tokenProgram = await getTokenProgram(tokenMint)
    if (!tokenProgram) throw new Error('Token program not found')
    console.log('DEBUG: tokenProgram', tokenProgram.toBase58())

    const createTime = Math.floor(Date.now() / 1000)
    const [splTokenRedPacket] = web3.PublicKey.findProgramAddressSync(
        [creator.toBuffer(), Uint8Array.from(new BN(createTime).toArray('le', 8))],
        program.programId,
    )

    console.log('DEBUG: createRedPacketWithNativeToken')
    console.log({
        totalNumber,
        totalAmount,
        createTime,
        duration,
        ifSpiltRandom,
        tokenMint: tokenMint.toBase58(),
        tokenAccount: tokenAccount.toBase58(),
        pubkeyForClaimSignature: pubkeyForClaimSignature.toBase58(),
        splTokenRedPacket: splTokenRedPacket.toBase58(),
        programId: program.programId.toBase58(),
        system: web3.SystemProgram.programId.toBase58(),
    })

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

    const rp = await program.account.redPacket.fetch(splTokenRedPacket)

    console.log('DEBUG: rp')
    console.log(rp)

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
) {
    // Ensure the totalNumber and totalAmount are within the acceptable range
    if (totalNumber > MAX_NUM) {
        throw new Error(`Total number of red packets cannot exceed ${MAX_NUM}`)
    }
    if (totalAmount > MAX_AMOUNT) {
        throw new Error(`Total amount of red packets cannot exceed ${MAX_AMOUNT}`)
    }

    const program = await getRpProgram()

    const connection = await getSolanaConnection()

    const tokenAccount = await getTokenAccount(tokenMint)
    if (!tokenAccount) throw new Error('Token account not found')
    console.log('DEBUG: tokenAccount', tokenAccount.toBase58())

    const tokenProgram = await getTokenProgram(tokenMint)
    if (!tokenProgram) throw new Error('Token program not found')
    console.log('DEBUG: tokenProgram', tokenProgram.toBase58())

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
