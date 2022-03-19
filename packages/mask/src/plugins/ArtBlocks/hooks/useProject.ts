import { NetworkPluginID, useChainId } from '@masknet/plugin-infra'
import { useAsyncRetry } from 'react-use'
import { fetchProject } from '../apis'

export function useFetchProject(projectId: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!projectId) return null
        return fetchProject(chainId, projectId)
    }, [chainId, projectId])
}
