import { useAsync } from 'react-use'
import { PluginProfileRPC } from '../../messages'

export function useFootprints() {
    const { value: footprints = [], loading } = useAsync(async () => {
        const pageOwner = await PluginProfileRPC.getPageOwner()
        const rsp = await PluginProfileRPC.getFootprints(pageOwner.address)
        return rsp.status ? rsp.assets : []
    }, [])

    return {
        footprints,
        loading,
    }
}
