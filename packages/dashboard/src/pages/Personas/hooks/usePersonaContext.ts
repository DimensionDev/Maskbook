import { createContainer } from 'unstated-next'
import { useCallback, useEffect, useState } from 'react'
import { head } from 'lodash-es'
import { useConnectSocialNetwork, useDisconnectSocialNetwork } from './useConnectSocialNetwork'
import { Services } from '../../../API'
import { Identifier, PersonaIdentifier } from '@dimensiondev/maskbook-shared'
import { useOwnedPersonas, useDefinedSocialNetworkUIs } from '../api'
import { useCreatePersona } from './useCreatePersona'
import { ECKeyIdentifier, useValueRef } from '@dimensiondev/maskbook-shared'
import { currentPersonaIdentifier } from '../settings'

function usePersonaContext() {
    const currentPersonaIdentifierRef = Identifier.fromString<ECKeyIdentifier>(
        useValueRef(currentPersonaIdentifier),
        ECKeyIdentifier,
    )
    const definedSocialNetworkUIs = useDefinedSocialNetworkUIs()

    const myPersonas = useOwnedPersonas()
    const currentPersona = currentPersonaIdentifierRef
        .map((key) => myPersonas.find((id) => key.equals(id.identifier)))
        .unwrapOr(undefined)

    const [open, setOpen] = useState(false)

    const [, onConnect] = useConnectSocialNetwork()
    const [, onDisconnect] = useDisconnectSocialNetwork()
    const [, onAddPersona] = useCreatePersona()
    const onRename = Services.Identity.renamePersona
    const onChangeCurrentPersona = useCallback((persona: PersonaIdentifier) => {
        currentPersonaIdentifier.value = persona.toText()
    }, [])

    useEffect(() => {
        if (myPersonas.length) {
            const persona = !currentPersonaIdentifierRef.ok
                ? head(myPersonas)
                : myPersonas.find((i) => i.identifier.equals(currentPersonaIdentifierRef.unwrap()))

            if (persona) currentPersonaIdentifier.value = persona.identifier.toText()
        }
    }, [myPersonas, currentPersonaIdentifierRef])

    return {
        onConnect,
        onDisconnect,
        onAddPersona,
        onRename,
        definedSocialNetworkUIs,
        personas: myPersonas,
        onChangeCurrentPersona,
        currentPersona,
        drawerOpen: open,
        toggleDrawer: () => setOpen((e) => !e),
    }
}

export const PersonaContext = createContainer(usePersonaContext)
