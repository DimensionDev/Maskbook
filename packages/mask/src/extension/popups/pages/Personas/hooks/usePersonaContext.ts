import { createContainer } from 'unstated-next'
import { useValueRef } from '@masknet/shared-base-ui'
import { ECKeyIdentifier, Identifier, PersonaInformation } from '@masknet/shared-base'
import { currentPersonaIdentifier } from '../../../../../settings/settings'
import { useAsync, useAsyncRetry } from 'react-use'
import Services from '../../../../service'
import { head } from 'lodash-unified'
import { useEffect, useState } from 'react'
import { MaskMessages } from '../../../../../utils'

function usePersonaContext() {
    const [selectedPersona, setSelectedPersona] = useState<PersonaInformation>()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personas, retry } = useAsyncRetry(async () => Services.Identity.queryOwnedPersonaInformation())
    const { value: avatar } = useAsync(Services.Identity.getCurrentPersonaAvatar, [currentIdentifier])
    useEffect(() => {
        return MaskMessages.events.ownPersonaChanged.on(retry)
    }, [retry])

    const currentPersona = personas?.find((x) =>
        x.identifier.equals(
            Identifier.fromString(currentIdentifier, ECKeyIdentifier).unwrapOr(head(personas)?.identifier),
        ),
    )

    return {
        avatar,
        personas,
        currentPersona,
        selectedPersona,
        setSelectedPersona,
    }
}

export const PersonaContext = createContainer(usePersonaContext)
