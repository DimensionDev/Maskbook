import { NetworkPluginID } from '@masknet/web3-shared-base'
import { fetchProject } from '../apis'
import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/plugin-infra/web3'

export function useFetchProject(projectId: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!projectId) return null

        return fetchProject(chainId, projectId)
    }, [chainId, projectId])
}
