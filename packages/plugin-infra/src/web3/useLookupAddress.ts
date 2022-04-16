import { useAsync } from 'react-use'
import { useChainId, useWeb3State } from '.'
import type { NetworkPluginID } from '../web3-types'

export function useLookupAddress(pluginId?: NetworkPluginID, domain?: string) {
    const chainId = useChainId(pluginId)
    const { NameService, Utils } = useWeb3State(pluginId)

    return useAsync(async () => {
        return domain && Utils?.isValidDomain?.(domain) ? NameService?.lookup?.(chainId, domain) : undefined
    }, [NameService, Utils, domain, chainId])
}
