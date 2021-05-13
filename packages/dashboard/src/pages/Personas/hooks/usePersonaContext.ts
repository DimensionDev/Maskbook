import { createContainer } from 'unstated-next'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { compact, head } from 'lodash-es'
import { useConnectSocialNetwork, useDisconnectSocialNetwork } from './useConnectSocialNetwork'
import { Services } from '../../../API'
import type { PersonaIdentifier } from '@dimensiondev/maskbook-shared'
import { useDefinedSocialNetworkUIs, useMyPersonas } from '../api'
import type { PersonaInfo, ProfileInfo } from '../type'
import { useCreatePersona } from './useCreatePersona'
import { ECKeyIdentifier, useValueRef } from '@dimensiondev/maskbook-shared'
import { currentPersonaIdentifier } from '../settings'

function usePersonaContext() {
    const currentPersonaIdentifierRef = useValueRef(currentPersonaIdentifier)

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
            .map<PersonaInfo>((persona) => {
                const profiles = persona ? [...persona.linkedProfiles] : []
                const providers = compact(
                    definedSocialNetworkUIs.map<ProfileInfo | null>((i) => {
                        const profile = profiles.find(([key]) => key.network === i.networkIdentifier)
                        if (i.networkIdentifier === 'localhost') return null
                        const x: ProfileInfo = {
                            connected: !!profile,
                            identifier: profile?.[0]!,
                        }
                        return x
                    }),
                )

                return {
                    identifier: persona.identifier,
                    nickname: persona.nickname,
                    linkedProfiles: providers,
                }
            })
    }, [myPersonas])

    const [, onConnect] = useConnectSocialNetwork()

    const [, onDisconnect] = useDisconnectSocialNetwork()

    const [, onAddPersona] = useCreatePersona()

    const onRename = useCallback(async (target: string, identifier: PersonaIdentifier) => {
        await Services.Identity.renamePersona(identifier, target)
    }, [])

    const onChangeCurrentPersona = useCallback((persona: PersonaInfo) => {
        currentPersonaIdentifier.value = persona.identifier.toText()
        setCurrentPersona(persona)
    }, [])

    useEffect(() => {
        if (personas.length) {
            const persona = !currentPersonaIdentifierRef
                ? head(personas)
                : personas.find((i) =>
                      i.identifier.equals(ECKeyIdentifier.fromString(currentPersonaIdentifierRef).unwrap()),
                  )

            if (persona) {
                currentPersonaIdentifier.value = persona.identifier.toText()
                setCurrentPersona(persona)
            }
        }
    }, [personas, currentPersonaIdentifierRef])

    return {
        onConnect,
        onDisconnect,
        onAddPersona,
        onRename,
        personas,
        onChangeCurrentPersona,
        currentPersona: currentPersona,
        drawerOpen: open,
        toggleDrawer: () => setOpen((e) => !e),
    }
}

export const PersonaContext = createContainer(usePersonaContext)
