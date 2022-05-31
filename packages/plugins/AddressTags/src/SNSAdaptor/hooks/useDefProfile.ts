import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsync'
import { PluginProfileRPC } from '../../messages'
import type { DefProfile } from '../../types'

export function useDefProfile(address: string): AsyncState<DefProfile> {
    return useAsync(async () => {
        const response = await PluginProfileRPC.getDefProfile(address)
        return response
    }, [address])
}
