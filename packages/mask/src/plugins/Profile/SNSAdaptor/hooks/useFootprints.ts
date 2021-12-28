import { useAsync } from 'react-use'
import { PluginProfileRPC } from '../../messages'

export function useFootprints(address: string) {
    return useAsync(async () => {
        const response = await PluginProfileRPC.getFootprints(address)
        return response.status ? response.assets : []
    }, [address])
}
