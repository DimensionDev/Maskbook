import { useAsync } from 'react-use'
import { PluginProfileRPC } from '../../messages'

export function useRss3Profile(address: string) {
    return useAsync(async () => {
        if (!address) return null
        return PluginProfileRPC.getRSS3ProfileByAddress(address)
    }, [address])
}
