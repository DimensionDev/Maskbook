import { NextIDProof } from '@masknet/web3-providers'
import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { Messages } from '../../../API'

export function usePersonaProof(publicHexKey: string) {
    const res = useAsyncRetry(async () => {
        return NextIDProof.queryExistedBindingByPersona(publicHexKey)
    }, [publicHexKey])
    useEffect(() => Messages.events.ownProofChanged.on(res.retry), [res.retry])
    return res
}
