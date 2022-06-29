import { createContainer } from 'unstated-next'
import { useValueRef } from '@masknet/shared-base-ui'
import { ECKeyIdentifier, EMPTY_LIST, PersonaInformation } from '@masknet/shared-base'
import { currentPersonaIdentifier } from '../../../../../settings/settings'
import { useAsyncRetry } from 'react-use'
import Services from '../../../../service'
import { head } from 'lodash-unified'
import { useCallback, useEffect, useState } from 'react'
import { MaskMessages } from '../../../../../utils'
import { NextIDProof } from '@masknet/web3-providers'
import type { Account } from '../type'
import { initialPersonaInformation } from './PersonaContextInitialData'

function useSSRPersonaInformation() {
    const [personas, setPersonas] = useState(initialPersonaInformation)
    const revalidate = useCallback(
        () => void Services.Identity.queryOwnedPersonaInformation(false).then(setPersonas),
        [],
    )
    useEffect(() => void initialPersonaInformation ?? revalidate(), [])
    useEffect(() => MaskMessages.events.ownPersonaChanged.on(revalidate), [])

    return { personas }
}
function usePersonaContext() {
    const [selectedAccount, setSelectedAccount] = useState<Account>()
    const [selectedPersona, setSelectedPersona] = useState<PersonaInformation>()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    const { personas } = useSSRPersonaInformation()

    const currentPersona = personas?.find(
        (x) => x.identifier === ECKeyIdentifier.from(currentIdentifier).unwrapOr(head(personas)?.identifier),
    )
    const avatar = currentPersona?.avatar

    const {
        value: proofs,
        retry: refreshProofs,
        loading: fetchProofsLoading,
    } = useAsyncRetry(async () => {
        try {
            if (!currentPersona?.identifier.publicKeyAsHex) return EMPTY_LIST

            const binding = await NextIDProof.queryExistedBindingByPersona(currentPersona.identifier.publicKeyAsHex)

            return binding?.proofs ?? EMPTY_LIST
        } catch {
            return EMPTY_LIST
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
