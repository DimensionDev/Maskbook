import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsync'
import { PluginProfileRPC } from '../../messages'
import type { POAPAction } from '../../types'

export function usePoapActions(address: string): AsyncState<POAPAction[]> {
    return useAsync(async () => {
        const response = await PluginProfileRPC.getPOAPActions(address)
        return response
    }, [address])
}
