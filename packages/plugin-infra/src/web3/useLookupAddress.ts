import { useAsync } from 'react-use'
import { useChainId, useWeb3State } from '.'
import type { NetworkPluginID } from '../web3-types'

export function useLookupAddress<T extends NetworkPluginID>(pluginId?: T, domain?: string) {
    const chainId = useChainId(pluginId)
    const { NameService, Utils } = useWeb3State(pluginId)

    return useAsync(async () => {
        // @ts-ignore
        return domain && Utils?.isValidDomain?.(domain) ? NameService?.lookup?.(chainId, domain) : undefined
    }, [NameService, Utils, domain, chainId])
}
