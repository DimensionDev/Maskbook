import { useAsync } from 'react-use'
import { PluginProfileRPC } from '../../messages'

export function useDonations(address: string) {
    const { value: donations = [], loading } = useAsync(async () => {
        const rsp = await PluginProfileRPC.getDonations(address)
        return rsp.status ? rsp.assets : []
    }, [address])

    return {
        donations,
        loading,
    }
}
