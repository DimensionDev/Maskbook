import { useWeb3StateContext } from '../context'

export function useChainDetailed() {
    const { chainDetailed, maskWalletChainDetail } = useWeb3StateContext()

    if (location.pathname === '/popups.html') return maskWalletChainDetail

    return chainDetailed
}
