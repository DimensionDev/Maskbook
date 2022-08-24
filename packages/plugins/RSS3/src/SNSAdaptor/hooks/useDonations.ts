import { RSS3 } from '@masknet/web3-providers'
import { useAsync } from 'react-use'

export function useDonations(address: string) {
    return useAsync(async () => {
        return RSS3.getDonations(address)
    }, [address])
}
