import { queryExistedBindingByPersona } from '@masknet/web3-providers'
import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { Messages } from '../../../API'
import { PersonaContext } from './usePersonaContext'

export function usePersonaProof() {
    const { currentPersona } = PersonaContext.useContainer()
    const res = useAsyncRetry(async () => {
        if (!currentPersona || !currentPersona.publicHexKey) return
        return queryExistedBindingByPersona(currentPersona.publicHexKey)
    }, [])
    useEffect(() => Messages.events.ownProofChanged.on(res.retry), [res.retry])
    return res
}
