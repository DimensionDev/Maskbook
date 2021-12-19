import { useAsync } from 'react-use'
import { PluginProfileRPC } from '../../messages'
import type { RSS3Profile } from '../../apis/types'

export function useRss3Profile(address: string) {
    const { value: profile = {} as RSS3Profile, loading } = useAsync(async () => {
        if (!address) return {} as RSS3Profile
        const rsp = await PluginProfileRPC.getRss3Profile(address)
        return rsp
    }, [address])

    return {
        profile,
        loading,
    }
}
