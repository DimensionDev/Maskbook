import { useAsync } from 'react-use'
import { PluginProfileRPC } from '../../messages'

export function useDonations() {
    const { value: donations = [], loading } = useAsync(async () => {
        const { listed } = await PluginProfileRPC.initAssets('Gitcoin-Donation')
        return listed
    }, [])

    return {
        donations,
        loading,
    }
}
