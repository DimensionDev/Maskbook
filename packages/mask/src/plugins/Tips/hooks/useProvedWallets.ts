import { ECKeyIdentifier, EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { NextIDProof } from '@masknet/web3-providers'
import { head } from 'lodash-unified'
import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { currentPersonaIdentifier } from '../../../../shared/legacy-settings/settings'
import { MaskMessages } from '../../../utils'

export function useProvedWallets() {
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personas, retry } = useAsyncRetry(
        async () => Services.Identity.queryOwnedPersonaInformation(false),
        [currentIdentifier],
    )
    useEffect(() => {
        return MaskMessages.events.ownPersonaChanged.on(retry)
    }, [retry])
    const res = useAsyncRetry(async () => {
        if (!currentIdentifier) return EMPTY_LIST
        const currentPersona = personas?.find(
            (x) => x.identifier === ECKeyIdentifier.from(currentIdentifier).unwrapOr(head(personas)?.identifier),
        )
        if (!currentPersona?.identifier.publicKeyAsHex) return EMPTY_LIST
        const { proofs } = (await NextIDProof.queryExistedBindingByPersona(currentPersona.identifier.publicKeyAsHex))!
        return proofs.filter((x) => x.platform === NextIDPlatform.Ethereum)
    }, [currentPersonaIdentifier, personas])

    return res
}
