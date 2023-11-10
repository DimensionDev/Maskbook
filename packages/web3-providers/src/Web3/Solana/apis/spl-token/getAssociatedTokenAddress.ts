import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'

export async function getAssociatedTokenAddress(
    mint: SolanaWeb3.PublicKey,
    owner: SolanaWeb3.PublicKey,
    allowOwnerOffCurve = false,
    programId = TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): Promise<SolanaWeb3.PublicKey> {
    if (!allowOwnerOffCurve && !SolanaWeb3.PublicKey.isOnCurve(owner.toBuffer()))
        throw new Error('TokenOwnerOffCurveError')

    const [address] = await SolanaWeb3.PublicKey.findProgramAddress(
        [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
        associatedTokenProgramId,
    )

    return address
}
