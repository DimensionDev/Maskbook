import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsync'
import { PluginProfileRPC } from '../../messages'
import type { DefProperty } from '../../types'

export function useDefProperties(address: string): AsyncState<DefProperty[]> {
    return useAsync(async () => {
        const response = await PluginProfileRPC.getDefProperties(address)
        return response
    }, [address])
}
