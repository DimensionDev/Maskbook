import { createContainer } from 'unstated-next'
import { ECKeyIdentifier, Identifier, useValueRef } from '@masknet/shared'
import { currentPersonaIdentifier } from '../../../../../settings/settings'
import { useAsyncRetry } from 'react-use'
import Services from '../../../../service'
import { head } from 'lodash-es'
import { useEffect } from 'react'
import { MaskMessage } from '../../../../../utils'

function usePersonaContext() {
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

    return {
        personas,
        currentPersona,
    }
}

export const PersonaContext = createContainer(usePersonaContext)
