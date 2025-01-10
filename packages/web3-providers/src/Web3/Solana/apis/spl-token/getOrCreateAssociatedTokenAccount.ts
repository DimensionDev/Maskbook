import type { Transaction } from '@masknet/web3-shared-solana'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import type { Commitment, Connection, PublicKey } from '@solana/web3.js'
import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import { createAssociatedTokenAccountInstruction } from './createAssociatedTokenAccountInstruction.js'
import { getAccountInfo } from './getAccountInfo.js'
import { getAssociatedTokenAddress } from './getAssociatedTokenAddress.js'

export async function getOrCreateAssociatedTokenAccount(
    connection: Connection,
    payer: PublicKey,
    mint: PublicKey,
    owner: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
    allowOwnerOffCurve = false,
    commitment: Commitment = 'single',
    programId = TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
) {
    const associatedToken = await getAssociatedTokenAddress(
        mint,
        owner,
        allowOwnerOffCurve,
        programId,
        associatedTokenProgramId,
    )

    // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
    // Sadly we can't do this atomically.
    let account
    try {
        account = await getAccountInfo(connection, associatedToken, commitment, programId)
    } catch (error: any) {
        // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
        // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
        // TokenInvalidAccountOwnerError in this code path.
        if (error.message === 'TokenAccountNotFoundError' || error.message === 'TokenInvalidAccountOwnerError') {
            // As this isn't atomic, it's possible others can create associated accounts meanwhile.
            try {
                const instruction = createAssociatedTokenAccountInstruction(
                    payer,
                    associatedToken,
                    owner,
                    mint,
                    programId,
                    associatedTokenProgramId,
                )
                const blockHash = await connection.getLatestBlockhash()
                const transaction = new SolanaWeb3.Transaction().add(instruction)
                const message = new SolanaWeb3.TransactionMessage({
                    payerKey: payer,
                    recentBlockhash: blockHash.blockhash,
                    instructions: [instruction],
                }).compileToV0Message()
                const tx = new SolanaWeb3.VersionedTransaction(message)

                transaction.feePayer = payer
                transaction.recentBlockhash = blockHash.blockhash
                const signed = await signTransaction(tx)

                const signature = await connection.sendRawTransaction(signed.serialize())

                await connection.confirmTransaction({
                    signature,
                    blockhash: blockHash.blockhash,
                    lastValidBlockHeight: blockHash.lastValidBlockHeight,
                })
            } catch (error: unknown) {
                // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
                // instruction error if the associated account exists already.
            }

            // Now this should always succeed
            account = await getAccountInfo(connection, associatedToken, commitment, programId)
        } else {
            throw error
        }
    }

    if (!account.mint.equals(mint)) throw new Error('TokenInvalidMintError')
    if (!account.owner.equals(owner)) throw new Error('TokenInvalidOwnerError')

    return account
}
