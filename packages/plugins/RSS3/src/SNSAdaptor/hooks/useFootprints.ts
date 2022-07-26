import { RSS3, RSS3BaseAPI } from '@masknet/web3-providers'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsync'

export function useFootprints(address: string): AsyncState<RSS3BaseAPI.Footprint[] | undefined> {
    return useAsync(async () => {
        const response = await RSS3.getFootprints(address)
        return response ?? []
    }, [address])
}
