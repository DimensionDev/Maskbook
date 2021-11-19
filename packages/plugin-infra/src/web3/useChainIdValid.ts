import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'
import { useAccount } from './useAccount'

export function useChainIdValid() {
    const account = useAccount()
    const chainId = useChainId()
    const { Utils } = useWeb3State()
    return !account || (Utils?.isChainIdValid?.(chainId, process.env.NODE_ENV === 'development') ?? false)
}
