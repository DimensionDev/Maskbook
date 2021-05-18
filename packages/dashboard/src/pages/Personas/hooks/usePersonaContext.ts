import { createContainer } from 'unstated-next'
import { useCallback, useState } from 'react'
import { useConnectSocialNetwork, useDisconnectSocialNetwork } from './useConnectSocialNetwork'
import { Services } from '../../../API'
import { useOwnedPersonas, useDefinedSocialNetworkUIs, SocialNetwork, useCurrentPersonaIdentifier } from '../api'
import { useCreatePersona } from './useCreatePersona'

function usePersonaContext() {
    const currentPersonaIdentifier = useCurrentPersonaIdentifier()
    const definedSocialNetworks: SocialNetwork[] = useDefinedSocialNetworkUIs()

    const personas = useOwnedPersonas()
    const currentPersona = personas.find((x) => x.identifier.equals(currentPersonaIdentifier))

    const [open, setOpen] = useState(false)

    const [, onConnect] = useConnectSocialNetwork()
    const [, onDisconnect] = useDisconnectSocialNetwork()
    const [, onAddPersona] = useCreatePersona()
    const onRename = Services.Identity.renamePersona
    const onChangeCurrentPersona = useCallback(Services.Settings.setCurrentPersonaIdentifier, [])

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
