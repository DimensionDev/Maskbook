import { getSolletWallet } from '@solana/wallet-adapter-wallets'
import type { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { useMemo } from 'react'

export function useSolletWallet(network: WalletAdapterNetwork) {
    const wallet = useMemo(() => getSolletWallet({ network }), [network])
    return wallet
}
