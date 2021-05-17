import { createContainer } from 'unstated-next'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useConnectSocialNetwork, useDisconnectSocialNetwork } from './useConnectSocialNetwork'
import { Services } from '../../../API'
import { Identifier, PersonaIdentifier } from '@dimensiondev/maskbook-shared'
import { useOwnedPersonas, useDefinedSocialNetworkUIs, SocialNetwork } from '../api'
import { useCreatePersona } from './useCreatePersona'
import { ECKeyIdentifier, useValueRef } from '@dimensiondev/maskbook-shared'
import { currentPersonaIdentifier } from '../settings'

function useCurrentPersonaIdentifier() {
    const raw = useValueRef(currentPersonaIdentifier)
    const currentPersonaIdentifierResult = useMemo(
        () => Identifier.fromString<ECKeyIdentifier>(raw, ECKeyIdentifier),
        [raw],
    )
    return currentPersonaIdentifierResult
}

function usePersonaContext() {
    const currentPersonaIdentifierResult = useCurrentPersonaIdentifier()
    const definedSocialNetworks: SocialNetwork[] = useDefinedSocialNetworkUIs()

    const personas = useOwnedPersonas()
    const currentPersona = currentPersonaIdentifierResult
        .map((key) => personas.find((id) => key.equals(id.identifier)))
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
        if (currentPersonaIdentifierResult.ok || !personas.length) return

        const firstValidPersona = personas.find((i) => i.identifier.equals(currentPersonaIdentifierResult.unwrap()))
        if (!firstValidPersona) return

        currentPersonaIdentifier.value = firstValidPersona.identifier.toText()
    }, [personas, currentPersonaIdentifierResult])

    return {
        onConnect,
        onDisconnect,
        onAddPersona,
        onRename,
        definedSocialNetworks,
        personas,
        onChangeCurrentPersona,
        currentPersona,
        drawerOpen: open,
        toggleDrawer: () => setOpen((e) => !e),
    }
}

export const PersonaContext = createContainer(usePersonaContext)
