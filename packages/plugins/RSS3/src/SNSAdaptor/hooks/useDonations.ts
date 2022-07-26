import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsync'
import { RSS3, RSS3BaseAPI } from '@masknet/web3-providers'

export function useDonations(address: string): AsyncState<RSS3BaseAPI.Donation[] | undefined> {
    return useAsync(async () => {
        const response = await RSS3.getDonations(address)
        return response
    }, [address])
}
