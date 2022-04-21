import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsync'
import { PluginProfileRPC } from '../../messages'
import type { GeneralAsset } from '../../types'

export function useFootprints(address: string): AsyncState<GeneralAsset[]> {
    return useAsync(async () => {
        const response = await PluginProfileRPC.getFootprints(address)
        return response.status ? response.assets : []
    }, [address])
}
