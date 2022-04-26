import { useAsyncRetry } from 'react-use'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from '@masknet/plugin-infra/web3'
import { fetchProject } from '../apis'

export function useFetchProject(projectId: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!projectId) return null
        return fetchProject(chainId, projectId)
    }, [chainId, projectId])
}
