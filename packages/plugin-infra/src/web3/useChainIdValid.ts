import { useAccount, useChainId, useWeb3State } from '.'

export function useChainIdValid() {
    const account = useAccount()
    const chainId = useChainId()
    const { Utils } = useWeb3State()
    return !account || (Utils?.isChainIdValid?.(chainId, process.env.NODE_ENV === 'development') ?? false)
}
