import { useAsyncRetry } from 'react-use'
import type { ChainId } from '..'
import { useFCL } from './'

export function useScript(chainId: ChainId, script: string) {
    const fcl = useFCL(chainId)

    return useAsyncRetry(async () => {
        return fcl.send([fcl.script(script)])
    }, [fcl, script])
}
