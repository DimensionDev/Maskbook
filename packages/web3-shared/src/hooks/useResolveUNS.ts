import { Resolution } from '@unstoppabledomains/resolution'
import { useAsyncRetry } from 'react-use'
import { useChainId } from '.'

export function useResolveUNS(uns: string) {
    const chainId = useChainId()

    return useAsyncRetry(async () => {
        if (!uns) return ''
        return resolve(uns)
    }, [uns, chainId])
}

async function resolve(uns: string) {
    const resolution = new Resolution()
    const result = await resolution.records(uns, ['crypto.ETH.address'])
    return result['crypto.ETH.address']
}
