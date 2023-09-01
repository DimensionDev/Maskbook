import { useCallback, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useConnectSite, useDisconnectSite, useOpenProfilePage } from './useConnectSite.js'
import { Services } from '../../../API.js'
import {
    useOwnedPersonas,
    useSupportedSocialNetworkSites,
    type SiteAdaptor,
    useCurrentPersonaIdentifier,
} from '../api.js'
import { useCreatePersona } from './useCreatePersona.js'
import { useDeleteBound } from './useOperateBindingProof.js'

function usePersonaContext() {
    const currentPersonaIdentifier = useCurrentPersonaIdentifier()
    const definedSocialNetworkAdaptors: SiteAdaptor[] = useSupportedSocialNetworkSites()
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
        definedSocialNetworkAdaptors,
        personas,
        openProfilePage,
        drawerOpen: open,
        toggleDrawer: () => setOpen((e) => !e),
    }
}

export const PersonaContext = createContainer(usePersonaContext)
PersonaContext.Provider.displayName = 'PersonaProvider'
