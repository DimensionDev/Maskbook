import { useCallback, useEffect, useMemo, useState } from 'react'
import { head, unionWith } from 'lodash-es'
import { createContainer } from 'unstated-next'
import { useValueRef } from '@masknet/shared-base-ui'
import {
    ECKeyIdentifier,
    EMPTY_LIST,
    isSameProfile,
    type PersonaInformation,
    ProfileIdentifier,
} from '@masknet/shared-base'
import { currentPersonaIdentifier } from '../../../../../../shared/legacy-settings/settings.js'
import Services from '../../../../service.js'
import { MaskMessages } from '../../../../../utils/index.js'
import type { Account } from '../type.js'
import { initialPersonaInformation } from './PersonaContextInitialData.js'
import { NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP, usePersonaProofs } from '@masknet/shared'

function useSSRPersonaInformation() {
    const [personas, setPersonas] = useState(useValueRef(initialPersonaInformation))
    const revalidate = useCallback(() => {
        Services.Identity.queryOwnedPersonaInformation(false)
            .then(setPersonas)
            .then(() => set(false))
    }, [])
    const [useServerSnapshot, set] = useState(true)
    useEffect(() => {
        initialPersonaInformation ?? revalidate()
    }, [])
    useEffect(() => MaskMessages.events.ownPersonaChanged.on(revalidate), [])

    return {
        personas: useServerSnapshot && !personas.length ? initialPersonaInformation.getServerSnapshot() : personas,
    }
}

function usePersonaContext() {
    const [selectedAccount, setSelectedAccount] = useState<Account>()
    const [selectedPersona, setSelectedPersona] = useState<PersonaInformation>()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    const { personas } = useSSRPersonaInformation()

    const currentPersona = personas?.find(
        (x) => x.identifier === ECKeyIdentifier.from(currentIdentifier).unwrapOr(head(personas)?.identifier),
    )
    const avatar = currentPersona?.avatar

    const { value: proofs, loading: fetchProofsLoading } = usePersonaProofs(
        currentPersona?.identifier.publicKeyAsHex,
        MaskMessages,
    )

    const accounts = useMemo(() => {
        if (!currentPersona) return EMPTY_LIST

        const localProfiles = currentPersona.linkedProfiles.map<Account>((profile) => ({
            ...profile,
            identity: profile.identifier.userId,
        }))

        if (!proofs) return localProfiles

        const remoteProfiles = proofs
            .filter((x) => !!NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP[x.platform])
            .map<Account>((x) => {
                return {
                    ...x,
                    identifier: ProfileIdentifier.of(
                        NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP[x.platform],
                        x.identity,
                    ).unwrap(),
                }
            })

        return unionWith(remoteProfiles, localProfiles, isSameProfile).map((x) => {
            const localProfile = localProfiles.find((profile) => isSameProfile(profile, x))
            if (!localProfile) return x
            return {
                ...x,
                ...localProfile,
            }
        })
    }, [proofs, currentPersona])

    return {
        accounts,
        selectedAccount,
        setSelectedAccount,
        avatar,
        personas,
        currentPersona,
        selectedPersona,
        setSelectedPersona,
        proofs,
        fetchProofsLoading,
    }
}

export const PersonaContext = createContainer(usePersonaContext)
