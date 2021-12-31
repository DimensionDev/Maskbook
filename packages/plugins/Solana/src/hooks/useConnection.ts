import { useMemo } from 'react'
import type { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

export function useConnection(network: WalletAdapterNetwork) {
    const connection = useMemo(() => {
        const endpoint = clusterApiUrl(network)
        return new Connection(endpoint)
    }, [network])

    return connection
}
