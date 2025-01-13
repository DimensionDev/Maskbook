import { getRpKeyPair } from './getRpKeyPair.js'
import { getRpProgram } from './getRpProgram.js'
import { getTokenProgram } from './getTokenAccount.js'
import { web3 } from '@coral-xyz/anchor'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { sign } from 'tweetnacl'

export async function claimWithSplToken(accountId: web3.PublicKey, receiver: web3.PublicKey) {
    // TODO: dead code
    const tokenMint = new web3.PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')

    const claimer = getRpKeyPair(accountId)
    if (!claimer) throw new Error('No claimer found')

    const tokenProgram = await getTokenProgram(tokenMint)
    if (!tokenProgram) throw new Error('Token program not found')

    const receiverTokenAccount = getAssociatedTokenAddressSync(tokenMint, receiver, true, tokenProgram)

    const vaultAccount = getAssociatedTokenAddressSync(tokenMint, accountId, true, tokenProgram)

    const message = Buffer.concat([accountId.toBytes(), receiver.toBytes()])

    const claimerSignature = sign.detached(message, claimer.secretKey)
    const verified = sign.detached.verify(message, claimerSignature, claimer.publicKey.toBytes())
    console.log('DEBUG: verified', verified)

    const ed25519Instruction = web3.Ed25519Program.createInstructionWithPublicKey({
        publicKey: claimer.publicKey.toBytes(),
        message,
        signature: claimerSignature,
    })

    const program = await getRpProgram()
    const signature = await program.methods
        .claimWithSplToken()
        .accounts({
            signer: receiver,
            // @ts-expect-error missing type
            redPacket: accountId,
            tokenMint,
            tokenAccount: receiverTokenAccount,
            vault: vaultAccount,
            tokenProgram,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId,
            instructionSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        })
        .preInstructions([ed25519Instruction])
        .rpc()

    console.log('The transaction signature is:', signature)

    return signature
}
