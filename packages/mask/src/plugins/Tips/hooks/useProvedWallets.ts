import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../../extension/service'
import { EMPTY_OBJECT, NextIDPlatform } from '@masknet/shared-base'

export function useProvedWallets() {
    const res = useAsyncRetry(async () => {
        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        if (!currentPersonaIdentifier) return EMPTY_OBJECT
        const currentPersona = await Services.Identity.queryPersona(currentPersonaIdentifier)
        if (!currentPersona?.publicHexKey) return EMPTY_OBJECT
        const { proofs } = await NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey)
        return proofs.filter((x) => x.platform === NextIDPlatform.Ethereum)
    }, [])

    return res
}
