import { createContainer } from 'unstated-next'
import { useCallback, useState } from 'react'
import { useConnectSocialNetwork, useDisconnectSocialNetwork, useOpenProfilePage } from './useConnectSocialNetwork'
import { Services } from '../../../API'
import { useOwnedPersonas, useDefinedSocialNetworkUIs, SocialNetwork, useCurrentPersonaIdentifier } from '../api'
import { useCreatePersona } from './useCreatePersona'
import { queryExistedBindingByPersona } from '@masknet/web3-providers'
import { useAsync, useAsyncRetry } from 'react-use'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import { useDeleteBound } from './useOperateBindingProof'

function usePersonaContext() {
    const currentPersonaIdentifier = useCurrentPersonaIdentifier()
    const definedSocialNetworks: SocialNetwork[] = useDefinedSocialNetworkUIs()
    const personas = useOwnedPersonas()
    const currentPersona = personas.find((x) => x.identifier.equals(currentPersonaIdentifier))

    const [open, setOpen] = useState(false)

    const personaPublicKey = useAsync(async () => {
        return Services.Identity.queryPersona(currentPersonaIdentifier as ECKeyIdentifier)
    }, [currentPersonaIdentifier]).value?.publicHexKey
    const verification = useAsyncRetry(async () => {
        return queryExistedBindingByPersona(personaPublicKey as string)
    }, [personaPublicKey]).value

    const [, connectPersona] = useConnectSocialNetwork()
    const [, openProfilePage] = useOpenProfilePage()
    const [, disconnectPersona] = useDisconnectSocialNetwork()
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
        verification,
    }
}

export const PersonaContext = createContainer(usePersonaContext)
