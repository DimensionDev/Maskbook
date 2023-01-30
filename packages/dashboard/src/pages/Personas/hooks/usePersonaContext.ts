import { useCallback, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useConnectSite, useDisconnectSite, useOpenProfilePage } from './useConnectSite.js'
import { Services } from '../../../API.js'
import { useOwnedPersonas, useSupportedSocialNetworkSites, SocialNetwork, useCurrentPersonaIdentifier } from '../api.js'
import { useCreatePersona } from './useCreatePersona.js'
import { useDeleteBound } from './useOperateBindingProof.js'
import { PersonaInformation } from '@masknet/shared-base'

function usePersonaContext() {
    const currentPersonaIdentifier = useCurrentPersonaIdentifier()
    const definedSocialNetworks: SocialNetwork[] = useSupportedSocialNetworkSites()
    const personas = useOwnedPersonas()
    const currentPersona: PersonaInformation | undefined = personas.find(
        (x) => x.identifier === currentPersonaIdentifier,
    )
    const [open, setOpen] = useState(false)

    const [, connectPersona] = useConnectSite()
    const [, openProfilePage] = useOpenProfilePage()
    const [, disconnectPersona] = useDisconnectSite()
    const [, createPersona] = useCreatePersona()
    const [, deleteBound] = useDeleteBound()
    const renamePersona = Services.Identity.renamePersona
    const changeCurrentPersona = useCallback(Services.Settings.setCurrentPersonaIdentifier, [])

    return {
        connectPersona,
        disconnectPersona,
        createPersona,
        renamePersona,
        changeCurrentPersona,
        deleteBound,
        currentPersona,
        definedSocialNetworks,
        personas,
        openProfilePage,
        drawerOpen: open,
        toggleDrawer: () => setOpen((e) => !e),
    }
}

export const PersonaContext = createContainer(usePersonaContext)
