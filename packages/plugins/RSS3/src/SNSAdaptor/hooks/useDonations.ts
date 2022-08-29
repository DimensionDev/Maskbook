import { RSS3 } from '@masknet/web3-providers'
import { useAsync } from 'react-use'

export function useDonations(address: string) {
    return useAsync(async () => {
        const { data } = await RSS3.getDonations(address)
        return data
    }, [address])
}
