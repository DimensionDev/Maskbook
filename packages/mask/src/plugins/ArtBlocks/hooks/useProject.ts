import { fetchProject } from '../apis'
import { useAsync } from 'react-use'
import { useChainId } from '@masknet/web3-shared-evm'

export function useFetchProject(projectId: string) {
    const chainId = useChainId()

    return useAsync(async () => {
        if (!projectId) return null

        return fetchProject(chainId, projectId)
    }, [chainId, projectId])
}
