import { useAsyncRetry } from 'react-use'
import type { ChainId } from '@masknet/web3-shared-evm'
import { fetchProject } from '../apis/index.js'

export function useFetchProject(projectId: string, chainId: ChainId) {
    return useAsyncRetry(async () => {
        if (!projectId) return null

        return fetchProject(chainId, projectId)
    }, [chainId, projectId])
}
