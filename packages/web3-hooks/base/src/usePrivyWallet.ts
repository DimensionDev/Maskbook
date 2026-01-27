import { isSameAddress } from '@masknet/web3-shared-base'
import { useWallets } from '@privy-io/react-auth'
import { useMemo } from 'react'

export function usePrivyWallet(address: string | undefined) {
    const { wallets, ready } = useWallets()

    return useMemo(() => {
        return ready && address ? wallets.find((x) => isSameAddress(x.address, address)) || null : null
    }, [wallets, ready, address])
}

function useMockPrivyWallet() {
    return null
}

export default process.env.PRIVY_APP_ID ? usePrivyWallet : useMockPrivyWallet
