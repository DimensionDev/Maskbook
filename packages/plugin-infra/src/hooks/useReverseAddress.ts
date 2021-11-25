import type { NetworkPluginID } from '../web3-types'
import { useWeb3State } from '../web3'
import { useAsync } from 'react-use'

export function useReverseAddress(address: string, pluginId?: NetworkPluginID) {
    const { NameService } = useWeb3State(pluginId)
    return useAsync(async () => NameService?.reverse?.(address), [NameService, address])
}
