import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { head } from 'lodash-es'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { type BindingProof, ECKeyIdentifier, EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import Services from '../../../extension/service.js'
import { currentPersonaIdentifier } from '../../../../shared/legacy-settings/settings.js'
import { MaskMessages } from '../../../utils/messages.js'
import { usePersonaProofs } from '@masknet/shared'

export function useProvedWallets(): AsyncStateRetry<BindingProof[]> {
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

    const proofs = usePersonaProofs(currentPersona?.identifier.publicKeyAsHex, MaskMessages)

    if (proofs.loading) {
        return {
            loading: true,
            retry,
        }
    }

    if (proofs.error) {
        return {
            loading: false,
            error: proofs.error,
            retry,
        }
    }

    return {
        loading: proofs.loading,
        value: proofs.value?.filter((x) => x.platform === NextIDPlatform.Ethereum) ?? EMPTY_LIST,
        retry: proofs.retry,
    }
}
