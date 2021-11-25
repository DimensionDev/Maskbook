import { useWeb3State } from '../web3'
import { useAsync } from 'react-use'
import type { NetworkPluginID } from '../web3-types'

export function useLookupAddress(domain: string, pluginId?: NetworkPluginID) {
    const { NameService } = useWeb3State(pluginId)
    return useAsync(async () => {
        if (NameService?.lookup) return NameService.lookup(domain)
        return ''
    }, [NameService, domain])
}
