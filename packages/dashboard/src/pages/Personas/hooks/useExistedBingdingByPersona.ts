import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import { Messages } from '../../../API'

export function useExistedBingdingByPersona(publicHexKey: string) {
    const response = useAsyncRetry(async () => {
        return NextIDProof.queryExistedBindingsByPersona(publicHexKey)
    }, [publicHexKey])
    useEffect(() => Messages.events.ownProofChanged.on(response.retry), [response.retry])
    return response
}
