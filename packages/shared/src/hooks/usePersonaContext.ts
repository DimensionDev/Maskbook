import { useEffect, useMemo, useState } from 'react'
import { isBefore } from 'date-fns'
import { createContainer, useValueRefReactQuery } from '@masknet/shared-base-ui'
import {
    type ECKeyIdentifier,
    EMPTY_LIST,
    type PersonaInformation,
    MaskMessages,
    currentPersonaIdentifier,
    type ProfileAccount,
} from '@masknet/shared-base'
import { Web3Storage } from '@masknet/web3-providers'
import { PERSONA_AVATAR_DB_NAMESPACE } from '../constants.js'
import type { PersonaAvatarData } from '../types.js'
import { useQuery, type RefetchOptions, type QueryObserverResult } from '@tanstack/react-query'

function usePersonaInformation(
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>,
) {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    const { data: personas = EMPTY_LIST, refetch } = useQuery({
        queryKey: ['@@my-own-persona-info'],
        queryFn: async () => (await queryOwnedPersonaInformation?.(false)) || null,
        refetchOnMount: true,
        networkMode: 'always',
    })
    useEffect(() => MaskMessages.events.ownPersonaChanged.on(() => refetch()), [])

    return { personas }
}

function usePersonaContext(initialState?: {
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>
    queryPersonaAvatarLastUpdateTime?: (identifier?: ECKeyIdentifier) => Promise<Date | undefined>
    queryPersonaAvatar?: (identifier: ECKeyIdentifier | undefined) => Promise<string | undefined>
}) {
    const [selectedAccount, setSelectedAccount] = useState<ProfileAccount>()
    const [selectedPersona, setSelectedPersona] = useState<PersonaInformation>()
    const currentIdentifier = useValueRefReactQuery('@@ref:currentPersonaIdentifier', currentPersonaIdentifier)

    const { personas } = usePersonaInformation(initialState?.queryOwnedPersonaInformation)

    const currentPersona = personas?.find((x) => x.identifier === (currentIdentifier || personas[0]?.identifier))

    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    const { data: avatar, refetch: refetchAvatar } = useQuery({
        enabled: !!currentPersona,
        queryKey: ['@@persona', 'avatar', currentPersona?.identifier.rawPublicKey],
        queryFn: async (): Promise<string | null> => {
            if (!initialState?.queryPersonaAvatarLastUpdateTime || !initialState.queryPersonaAvatar)
                return currentPersona!.avatar || null

            const lastUpdateTime = await initialState.queryPersonaAvatarLastUpdateTime(currentPersona!.identifier)
            const storage = Web3Storage.createKVStorage(PERSONA_AVATAR_DB_NAMESPACE)
            try {
                const remote = await storage.get<PersonaAvatarData>(currentPersona!.identifier.rawPublicKey)

                if (remote && lastUpdateTime && isBefore(lastUpdateTime, remote.updateAt)) {
                    return remote.imageUrl
                }
                return (await initialState.queryPersonaAvatar(currentPersona?.identifier)) || null
            } catch {
                return (await initialState.queryPersonaAvatar(currentPersona?.identifier)) || null
            }
        },
    })

    const accounts = useMemo(() => {
        if (!currentPersona) return EMPTY_LIST

        return currentPersona.linkedProfiles.map<ProfileAccount>((profile) => ({
            ...profile,
            identity: profile.identifier.userId,
        }))
    }, [currentPersona])

    return {
        accounts,
        selectedAccount,
        setSelectedAccount,
        avatar,
        refreshAvatar: refetchAvatar as (options?: RefetchOptions) => Promise<QueryObserverResult<string | null>>,
        personas,
        currentPersona,
        selectedPersona,
        setSelectedPersona,
    }
}

export const PersonaContext = createContainer(usePersonaContext)
PersonaContext.Provider.displayName = 'PersonaContext'
