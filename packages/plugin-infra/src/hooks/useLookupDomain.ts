import { useWeb3State } from '../web3'
import { useAsync } from 'react-use'
import type { NetworkPluginID } from '../web3-types'

export function useLookupAddress(domain: string, pluginId?: NetworkPluginID) {
    const { NameService, Utils } = useWeb3State(pluginId)
    return useAsync(async () => {
        if (NameService?.lookup && Utils?.isValidDomain?.(domain)) {
            return NameService.lookup(domain)
        }
        return ''
    }, [NameService, Utils, domain])
}
