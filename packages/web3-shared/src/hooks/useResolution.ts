import { Resolution } from '@unstoppabledomains/resolution'
import { useAsyncRetry } from 'react-use'
import { useChainId } from '.'

export function useResolution(ens: string) {
    const chainId = useChainId()
    const resolution = new Resolution()

    return useAsyncRetry(async () => {
        const result = await resolution.records(ens, ['crypto.ETH.address'])
        return result['crypto.ETH.address']
    }, [ens, chainId])
}
