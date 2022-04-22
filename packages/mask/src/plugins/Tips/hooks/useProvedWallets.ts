import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../../extension/service'
import { EMPTY_OBJECT } from '@masknet/shared-base'

export function useProvedWallets() {
    const res = useAsyncRetry(async () => {
        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        if (!currentPersonaIdentifier) return EMPTY_OBJECT
        const currentPersona = await Services.Identity.queryPersona(currentPersonaIdentifier)
        if (!currentPersona || !currentPersona.publicHexKey) return EMPTY_OBJECT
        return NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey)
    }, [])

    return res
}
