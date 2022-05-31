import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsync'
import { PluginProfileRPC } from '../../messages'
import type { GalaxyCredential } from '../../types'

export function useGalaxyCredentials(address: string): AsyncState<GalaxyCredential[]> {
    return useAsync(async () => {
        const response = await PluginProfileRPC.getGalaxyCredentials(address)
        return response
    }, [address])
}
