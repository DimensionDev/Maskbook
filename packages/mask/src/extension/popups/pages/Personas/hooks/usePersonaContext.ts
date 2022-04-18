import { createContainer } from 'unstated-next'
import { useValueRef } from '@masknet/shared-base-ui'
import { ECKeyIdentifier, Identifier, PersonaInformation } from '@masknet/shared-base'
import { currentPersonaIdentifier } from '../../../../../settings/settings'
import { useAsync, useAsyncRetry } from 'react-use'
import Services from '../../../../service'
import { head } from 'lodash-unified'
import { useEffect, useState } from 'react'
import { MaskMessages } from '../../../../../utils'
import { NextIDProof } from '@masknet/web3-providers'
import type { Account } from '../type'

function usePersonaContext() {
    const [selectedAccount, setSelectedAccount] = useState<Account>()
    const [selectedPersona, setSelectedPersona] = useState<PersonaInformation>()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personas, retry } = useAsyncRetry(
        async () => Services.Identity.queryOwnedPersonaInformation(),
        [currentPersonaIdentifier],
    )
    const { value: avatar } = useAsync(Services.Identity.getCurrentPersonaAvatar, [currentIdentifier])
    useEffect(() => {
        return MaskMessages.events.ownPersonaChanged.on(retry)
    }, [retry])

    const currentPersona = personas?.find((x) =>
        x.identifier.equals(
            Identifier.fromString(currentIdentifier, ECKeyIdentifier).unwrapOr(head(personas)?.identifier),
        ),
    )

    const {
        value: proofs,
        retry: refreshProofs,
        loading: fetchProofsLoading,
    } = useAsyncRetry(async () => {
        try {
            if (!currentPersona?.publicHexKey) return []

            const binding = await NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey)

            return binding?.proofs ?? []
        } catch {
            return []
        }
    }, [currentPersona])

    return {
        selectedAccount,
        setSelectedAccount,
        avatar,
        personas,
        currentPersona,
        selectedPersona,
        setSelectedPersona,
        proofs,
        refreshProofs,
        fetchProofsLoading,
    }
}

export const PersonaContext = createContainer(usePersonaContext)
