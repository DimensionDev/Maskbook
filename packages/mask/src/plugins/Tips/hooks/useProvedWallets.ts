import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../../extension/service'
export function useProvedWallets() {
    const res = useAsyncRetry(async () => {
        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        if (!currentPersonaIdentifier) return []
        const currentPersona = await Services.Identity.queryPersona(currentPersonaIdentifier)
        if (!currentPersona || !currentPersona.publicHexKey) return []
        return NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey)
    }, [])

    return res
}
