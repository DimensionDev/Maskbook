import { createContainer } from 'unstated-next'
import { ECKeyIdentifier, Identifier, PersonaInformation, useValueRef } from '@masknet/shared'
import { currentPersonaIdentifier } from '../../../../../settings/settings'
import { useAsync, useAsyncRetry } from 'react-use'
import Services from '../../../../service'
import { head } from 'lodash-es'
import { useEffect, useState } from 'react'
import { MaskMessage } from '../../../../../utils'

function usePersonaContext() {
    const [deletingPersona, setDeletingPersona] = useState<PersonaInformation>()

    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personas, retry } = useAsyncRetry(async () => Services.Identity.queryOwnedPersonaInformation())
    useEffect(() => {
        return MaskMessage.events.personaChanged.on(retry)
    }, [retry])

    const currentPersona = personas?.find((x) =>
        x.identifier.equals(
            Identifier.fromString(currentIdentifier, ECKeyIdentifier).unwrapOr(head(personas)?.identifier),
        ),
    )

    const otherPersonas = personas?.filter((x) => !x.identifier.equals(currentPersona?.identifier))

    //#region If currentPersona does not exist, it will be updated automatically
    useAsync(async () => {
        if (!currentPersona) {
            const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()
            if (lastCreatedPersona) await Services.Settings.setCurrentPersonaIdentifier(lastCreatedPersona.identifier)
        }
    }, [currentPersona])

    return {
        deletingPersona,
        setDeletingPersona,
        personas: otherPersonas,
        currentPersona,
    }
}

export const PersonaContext = createContainer(usePersonaContext)
