import { web3 } from '@coral-xyz/anchor'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { SolanaChainResolver } from '@masknet/web3-providers'
import type { SolanaRedPacketJSONPayload } from '@masknet/web3-providers/types'
import { isNativeTokenAddress } from '@masknet/web3-shared-solana'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import type { Cluster } from '@solana/web3.js'
import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import { useAsyncFn } from 'react-use'
import { sign } from 'tweetnacl'
import { getRpProgram } from '../../helpers/getRpProgram.js'

interface ClaimParams {
    cluster?: Cluster
    accountId: string
    password: string
    tokenAddress: string
    tokenProgram?: web3.PublicKey
}

/**
 * Claim fungible token red packet.
 */
export function useClaimCallback(payload: SolanaRedPacketJSONPayload = {} as SolanaRedPacketJSONPayload) {
    const payloadChainId = payload.token?.chainId
    const version = payload.contract_version
    const rpid = payload.rpid
    const { chainId: contextChainId } = useChainContext<NetworkPluginID.PLUGIN_SOLANA>({ chainId: payloadChainId })
    const chainIdByName = SolanaChainResolver.chainId('network' in payload ? payload.network! : '')
    const chainId = payloadChainId || chainIdByName || contextChainId
    return useAsyncFn(
        async ({ cluster, accountId, password, tokenAddress, tokenProgram }: ClaimParams) => {
            const isNativeToken = isNativeTokenAddress(tokenAddress)
            const tokenMint = new web3.PublicKey(tokenAddress)
            const program = await getRpProgram(cluster)
            const claimer = web3.Keypair.fromSecretKey(Uint8Array.from(Buffer.from(password, 'hex')))
            const receiver = program.provider.publicKey
            const redPacket = new web3.PublicKey(accountId)
            if (!receiver) return

            const message = Buffer.concat([redPacket.toBytes(), receiver.toBytes()])
            const claimerSignature = sign.detached(message, claimer.secretKey)
            const ed25519Instruction = web3.Ed25519Program.createInstructionWithPublicKey({
                message,
                publicKey: claimer.publicKey.toBytes(),
                signature: claimerSignature,
            })
            if (isNativeToken) {
                const signature = await program.methods
                    .claimWithNativeToken()
                    .accounts({
                        signer: receiver,
                        // @ts-expect-error missing type
                        redPacket,
                        systemProgram: SolanaWeb3.SystemProgram.programId,
                    })
                    .preInstructions([ed25519Instruction])
                    .rpc()
                return signature
            }

            if (!tokenProgram) return

            const receiverTokenAccount = getAssociatedTokenAddressSync(tokenMint, receiver, true, tokenProgram)
            const vault = getAssociatedTokenAddressSync(tokenMint, redPacket, true, tokenProgram)

            const signature = await program.methods
                .claimWithSplToken()
                .accounts({
                    signer: receiver,
                    // @ts-expect-error missing type
                    redPacket,
                    tokenMint,
                    tokenProgram,
                    tokenAccount: receiverTokenAccount,
                    vault,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                    instructionSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
                })
                .preInstructions([ed25519Instruction])
                .rpc({
                    commitment: 'confirmed',
                })

            return signature
        },
        [rpid, chainId, version],
    )
}
