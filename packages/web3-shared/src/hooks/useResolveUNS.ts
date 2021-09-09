import { Resolution } from '@unstoppabledomains/resolution'
import { useAsyncRetry } from 'react-use'
import { useChainId } from '.'

export function useResolveUNS(name: string) {
    const chainId = useChainId()

    return useAsyncRetry(async () => {
        if (!name) return ''
        return resolve(name)
    }, [name, chainId])
}

async function resolve(uns: string) {
    const resolution = new Resolution()
    const result = await resolution.records(uns, ['crypto.ETH.address'])
    return result['crypto.ETH.address']
}
