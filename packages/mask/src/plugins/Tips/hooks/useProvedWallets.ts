import { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { head } from 'lodash-es'
import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service.js'
import { currentPersonaIdentifier } from '../../../../shared/legacy-settings/settings.js'
import { MaskMessages, usePersonaProofs } from '../../../utils/index.js'

export function useProvedWallets() {
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personas, retry } = useAsyncRetry(
        async () => Services.Identity.queryOwnedPersonaInformation(false),
        [currentIdentifier],
    )

    useEffect(() => {
        return MaskMessages.events.ownPersonaChanged.on(retry)
    }, [retry])

    const currentPersona = personas?.find(
        (x) => x.identifier === ECKeyIdentifier.from(currentIdentifier).unwrapOr(head(personas)?.identifier),
    )

    const proofs = usePersonaProofs(currentPersona?.identifier.publicKeyAsHex)

    return {
        loading: proofs.loading,
        value: proofs.value.filter((x) => x.platform === NextIDPlatform.Ethereum),
        retry: proofs.retry,
    }
}
