import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsync.js'
import { PluginProfileRPC } from '../../messages.js'
import type { RSS3Profile } from '../../types.js'

export function useRSS3Profile(address?: string): AsyncState<RSS3Profile | null | undefined> {
    return useAsync(async () => {
        if (!address) return null
        return PluginProfileRPC.getRSS3ProfileByAddress(address)
    }, [address])
}
