import { useChainId } from './useChainId'
import { usePluginWeb3Context } from './Context'
import { useAccount } from './useAccount'

export function useChainIdValid() {
    const account = useAccount()
    const chainId = useChainId()
    const { Utils } = usePluginWeb3Context()
    return !account || (Utils?.isChainIdValid?.(chainId, process.env.NODE_ENV === 'development') ?? false)
}
