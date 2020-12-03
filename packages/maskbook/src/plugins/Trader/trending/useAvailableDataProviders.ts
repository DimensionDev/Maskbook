import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'

export function useAvailableDataProviders(keyword: string) {
    return useAsync(() => PluginTraderRPC.getAvailableDataProviders(keyword), [keyword])
}
