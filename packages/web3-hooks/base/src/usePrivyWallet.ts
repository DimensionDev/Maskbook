import { isSameAddress } from '@masknet/web3-shared-base'
import { useWallets } from '@privy-io/react-auth'
import { useMemo } from 'react'

export function usePrivyWallet(address: string | undefined) {
    if (!process.env.PRIVY_APP_ID) {
        return null
    }
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/rules-of-hooks
    const { wallets, ready } = useWallets()

    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/rules-of-hooks
    return useMemo(() => {
        return ready && address ? wallets.find((x) => isSameAddress(x.address, address)) || null : null
    }, [wallets, ready, address])
}
