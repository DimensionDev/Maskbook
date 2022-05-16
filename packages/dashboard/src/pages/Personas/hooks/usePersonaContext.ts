import { createContainer } from 'unstated-next'
import { useCallback, useState } from 'react'
import { useConnectSite, useDisconnectSite, useOpenProfilePage } from './useConnectSite'
import { Services } from '../../../API'
import { useOwnedPersonas, useSupportedSites, SocialNetwork, useCurrentPersonaIdentifier } from '../api'
import { useCreatePersona } from './useCreatePersona'
import { useDeleteBound } from './useOperateBindingProof'

function usePersonaContext() {
    const currentPersonaIdentifier = useCurrentPersonaIdentifier()
    const definedSocialNetworks: SocialNetwork[] = useSupportedSites()
    const personas = useOwnedPersonas()
    const currentPersona = personas.find((x) => x.identifier === currentPersonaIdentifier)
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
