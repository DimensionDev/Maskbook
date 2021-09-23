import { useWeb3StateContext } from '../context'

export function useNetworkType() {
    const { networkType, maskWalletNetworkType } = useWeb3StateContext()

    if (location.pathname === '/popups.html') return maskWalletNetworkType
    return networkType
}
