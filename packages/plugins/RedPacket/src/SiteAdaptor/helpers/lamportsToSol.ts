import { BN } from '@coral-xyz/anchor'

export function lamportsToSol(bnLamports: BN): string {
    // Convert BN lamports to SOL by dividing by 1_000_000_000 and return it as a string
    const sol = bnLamports.toString()
    return (parseFloat(sol) / 1_000_000_000).toString()
}
