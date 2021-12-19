import { useAsync } from 'react-use'
import { PluginProfileRPC } from '../../messages'

export function useDonations() {
    const { value: donations = [], loading } = useAsync(async () => {
        const pageOwner = await PluginProfileRPC.getPageOwner()
        const rsp = await PluginProfileRPC.getDonations(pageOwner.address)
        return rsp.status ? rsp.assets : []
    }, [])

    return {
        donations,
        loading,
    }
}
