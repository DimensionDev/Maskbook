import { useAsync } from 'react-use'
import { PluginProfileRPC } from '../../messages'

export function useDonations(address: string) {
    return useAsync(async () => {
        if (!address) return []
        const response = await PluginProfileRPC.getDonations(address)
        return response.status ? response.assets : []
    }, [address])
}
