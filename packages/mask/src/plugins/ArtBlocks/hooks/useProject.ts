import { useChainId } from '@masknet/plugin-infra/src/web3'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { useAsyncRetry } from 'react-use'
import { fetchProject } from '../apis'

export function useFetchProject(projectId: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!projectId) return null
        return fetchProject(chainId, projectId)
    }, [chainId, projectId])
}
