import { createContainer } from 'unstated-next'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { compact, head, isEmpty } from 'lodash-es'
import { useConnectSocialNetwork } from './useConnectSocialNetwork'
import { useDisConnectSocialNetwork } from './useDisConnectSocialNetwork'
import { Messages, Services } from '../../../API'
import type { PersonaIdentifier } from '@dimensiondev/maskbook-shared'
import { useDefinedSocialNetworkUIs, useMyPersonas } from '../api'
import type { PersonaInfo } from '../type'
import { useCreatePersona } from './useCreatePersona'

function usePersonaState() {
    const [currentPersona, setCurrentPersona] = useState<PersonaInfo>()

    const [open, setOpen] = useState(false)

    const definedSocialNetworkUIs = useDefinedSocialNetworkUIs()

    const myPersonas = useMyPersonas()

    const personas = useMemo<PersonaInfo[]>(() => {
        return myPersonas
            .sort((a, b) => {
                if (a.updatedAt > b.updatedAt) return -1
                if (a.updatedAt < b.updatedAt) return 1
                return 0
            })
            .map((persona) => {
                const profiles = persona ? [...persona.linkedProfiles] : []
                const providers = compact(
                    definedSocialNetworkUIs.map((i) => {
                        const profile = profiles.find(([key]) => key.network === i.networkIdentifier)
                        if (i.networkIdentifier === 'localhost') return null
                        return {
                            networkIdentifier: i.networkIdentifier,
                            network: i.networkIdentifier,
                            connected: !!profile,
                            userId: profile?.[0].userId,
                            identifier: profile?.[0],
                        }
                    }),
                )

                return {
                    identifier: persona.identifier,
                    nickname: persona.nickname,
                    providers: providers,
                }
            })
    }, [myPersonas])

    const [, onConnect] = useConnectSocialNetwork()

    const [, onDisConnect] = useDisConnectSocialNetwork()

    const [, onAddPersona] = useCreatePersona()

    const onRename = useCallback(async (target: string, identifier: PersonaIdentifier) => {
        await Services.Identity.renamePersona(identifier, target)
    }, [])

    const onChangeCurrentPersona = useCallback((persona: PersonaInfo) => {
        setCurrentPersona(persona)
    }, [])

    useEffect(() => {
        if (personas.length) {
            setCurrentPersona(head(personas))
        }
    }, [personas])

    //TODO: Maybe better way
    useEffect(() =>
        Messages.events.personaChanged.on((event) => {
            // When current persona has changed, update the persona info
            if (!isEmpty(currentPersona) && event.some((x) => x.of.equals(currentPersona?.identifier))) {
                const persona = personas.find((i) => i.identifier.equals(currentPersona?.identifier))
                if (persona) setCurrentPersona(persona)
            }
        }),
    )

    return {
        onConnect,
        onDisConnect,
        onAddPersona,
        onRename,
        personas,
        onChangeCurrentPersona,
        currentPersona: currentPersona,
        drawerOpen: open,
        toggleDrawer: () => setOpen((e) => !e),
    }
}

export const PersonaState = createContainer(usePersonaState)
