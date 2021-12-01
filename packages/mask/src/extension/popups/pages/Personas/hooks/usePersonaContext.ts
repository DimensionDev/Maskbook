import { createContainer } from 'unstated-next'
import { ECKeyIdentifier, Identifier, PersonaInformation, useValueRef } from '@masknet/shared'
import { currentPersonaIdentifier } from '../../../../../settings/settings'
import { useAsyncRetry } from 'react-use'
import Services from '../../../../service'
import { head } from 'lodash-unified'
import { useEffect, useState } from 'react'
import { MaskMessages } from '../../../../../utils'

function usePersonaContext() {
    const [deletingPersona, setDeletingPersona] = useState<PersonaInformation>()

    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personas, retry } = useAsyncRetry(async () => Services.Identity.queryOwnedPersonaInformation())
    useEffect(() => {
        return MaskMessages.events.ownPersonaChanged.on(retry)
    }, [retry])

    const currentPersona = personas?.find((x) =>
        x.identifier.equals(
            Identifier.fromString(currentIdentifier, ECKeyIdentifier).unwrapOr(head(personas)?.identifier),
        ),
    )

    const otherPersonas = personas?.filter((x) => !x.identifier.equals(currentPersona?.identifier))

    return {
        deletingPersona,
        setDeletingPersona,
        personas: otherPersonas,
        currentPersona,
    }
}

export const PersonaContext = createContainer(usePersonaContext)
