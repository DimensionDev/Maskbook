import type { AsyncState } from 'react-use/lib/useAsync'
import useAsync from 'react-use/lib/useAsync'
import { getFootprints } from '../api'
import type { GeneralAsset } from '../types'

export function useFootprints(address: string): AsyncState<GeneralAsset[]> {
    return useAsync(async () => {
        const response = await getFootprints(address)
        return response.status ? response.assets : []
    }, [address])
}
