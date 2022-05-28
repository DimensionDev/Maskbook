import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { Messages, Services } from '../../../API'

export function usePersonaProof(publicHexKey: string) {
    const res = useAsyncRetry(async () => {
        return Services.Helper.queryExistedBindingByPersona(publicHexKey)
    }, [publicHexKey])
    useEffect(() => Messages.events.ownProofChanged.on(res.retry), [res.retry])
    return res
}
