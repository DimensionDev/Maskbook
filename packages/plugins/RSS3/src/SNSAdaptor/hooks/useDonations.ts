import { useAsync } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import { PluginProfileRPC } from '../../messages'

export function useDonations(address: string) {
    return useAsync(async () => {
        const response = await PluginProfileRPC.getDonations(address)
        return response.status ? response.assets : EMPTY_LIST
    }, [address])
}
