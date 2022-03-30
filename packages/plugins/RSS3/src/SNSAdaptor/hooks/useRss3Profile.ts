import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsync'
import { PluginProfileRPC } from '../../messages'
import type { RSS3Profile } from '../../types'

export function useRss3Profile(address: string): AsyncState<RSS3Profile | null | undefined> {
    return useAsync(async () => {
        if (!address) return null
        return PluginProfileRPC.getRSS3ProfileByAddress(address)
    }, [address])
}
