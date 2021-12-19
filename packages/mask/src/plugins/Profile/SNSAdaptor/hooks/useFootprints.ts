import { useAsync } from 'react-use'
import { PluginProfileRPC } from '../../messages'

export function useFootprints() {
    const { value: footprints = [], loading } = useAsync(async () => {
        const { listed } = await PluginProfileRPC.initAssets('POAP')
        return listed
    }, [])

    return {
        footprints,
        loading,
    }
}
