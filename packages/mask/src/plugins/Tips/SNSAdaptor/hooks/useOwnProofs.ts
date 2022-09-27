import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { head } from 'lodash-unified'
import { ECKeyIdentifier, EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../../../extension/service.js'
import { currentPersonaIdentifier } from '../../../../../shared/legacy-settings/settings.js'
import { MaskMessages } from '../../../../utils/index.js'

export function useOwnProofs(platform: NextIDPlatform) {
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personas, retry } = useAsyncRetry(
        async () => Services.Identity.queryOwnedPersonaInformation(false),
        [currentIdentifier],
    )

    useEffect(() => {
        return MaskMessages.events.ownPersonaChanged.on(retry)
    }, [retry])

    const asyncResult = useAsyncRetry(async () => {
        if (!currentIdentifier) return EMPTY_LIST
        const currentPersona = personas?.find(
            (x) => x.identifier === ECKeyIdentifier.from(currentIdentifier).unwrapOr(head(personas)?.identifier),
        )
        if (!currentPersona?.identifier.publicKeyAsHex) return EMPTY_LIST
        const { proofs } = (await NextIDProof.queryExistedBindingByPersona(currentPersona.identifier.publicKeyAsHex))!
        return proofs.filter((x) => x.platform === platform)
    }, [platform, currentPersonaIdentifier, personas])

    useEffect(() => MaskMessages.events.ownProofChanged.on(asyncResult.retry), [asyncResult.retry])

    return asyncResult
}
