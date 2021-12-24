import { useAsync } from 'react-use'
import { PluginProfileRPC } from '../../messages'

export function useFootprints(address: string) {
    const { value: footprints = [], loading } = useAsync(async () => {
        const rsp = await PluginProfileRPC.getFootprints(address)
        return rsp.status ? rsp.assets : []
    }, [address])

    return {
        footprints,
        loading,
    }
}
