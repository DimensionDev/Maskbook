import { useAsync } from 'react-use'
import { RSS3 } from '@masknet/web3-providers'

export function useDonations(address: string) {
    return useAsync(async () => {
        const { data } = await RSS3.getDonations(address)
        return data
    }, [address])
}
