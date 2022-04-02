import { createContainer } from 'unstated-next'
import { useValueRef } from '@masknet/shared-base-ui'
import { ECKeyIdentifier, Identifier, PersonaInformation } from '@masknet/shared-base'
import { currentPersonaIdentifier } from '../../../../../settings/settings'
import Services from '../../../../service'
import { head } from 'lodash-unified'
import { useEffect, useMemo, useState } from 'react'
import { MaskMessages } from '../../../../../utils'
import type { ProfileInformationWithNextID } from '../../../../background-script/IdentityService'

export const initData: {
    currentIdentifier?: string
    personas?: PersonaInformation[]
    profiles?: ProfileInformationWithNextID[]
} = {}
function usePersonaContext() {
    const [deletingPersona, setDeletingPersona] = useState<PersonaInformation>()

    let currentIdentifier = useValueRef(currentPersonaIdentifier)
    if (!currentPersonaIdentifier.ready && initData.currentIdentifier) currentIdentifier = initData.currentIdentifier

    const [personas, setPersonas] = useState<PersonaInformation[] | undefined>(initData.personas)
    useEffect(() => {
        const f = Services.Identity.queryOwnedPersonaInformation
        if (!initData.personas) f().then(setPersonas)
        return MaskMessages.events.ownPersonaChanged.on(() => f().then(setPersonas))
    }, [initData.personas])

    const currentPersona = personas?.find((x) =>
        x.identifier.equals(
            Identifier.fromString(currentIdentifier, ECKeyIdentifier).unwrapOr(head(personas)?.identifier),
        ),
    )

    const otherPersonas = useMemo(
        () => personas?.filter((x) => !x.identifier.equals(currentPersona?.identifier)),
        [personas, currentPersona?.identifier],
    )

    return useMemo(
        () => ({
            deletingPersona,
            setDeletingPersona,
            personas: otherPersonas,
            currentPersona,
        }),
        [deletingPersona, otherPersonas, currentPersona],
    )
}

export const PersonaContext = createContainer(usePersonaContext)
