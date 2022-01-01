import { useMemo } from 'react'

export function useTerraStation(network: WalletAdapterNetwork) {
    const wallet = useMemo(() => getSolletWallet({ network }), [network])
    return wallet
}
