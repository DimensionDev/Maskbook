import { useAsyncRetry } from 'react-use'
import { useFCL } from './'

export function useScript(script: string) {
    const fcl = useFCL()

    return useAsyncRetry(async () => {
        return fcl.send([fcl.script(script)])
    }, [fcl, script])
}
