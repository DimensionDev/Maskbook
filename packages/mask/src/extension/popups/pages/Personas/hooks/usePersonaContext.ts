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
    NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP,
} from '@masknet/shared-base'
import { currentPersonaIdentifier } from '../../../../../../shared/legacy-settings/settings.js'
import Services from '../../../../service.js'
import { MaskMessages } from '../../../../../utils/index.js'
import type { Account } from '../type.js'
import { initialPersonaInformation } from './PersonaContextInitialData.js'
import { usePersonaProofs } from '@masknet/shared'

function useSSRPersonaInformation() {
    const [personas, setPersonas] = useState(useValueRef(initialPersonaInformation))
    const revalidate = useCallback(() => {
        Services.Identity.queryOwnedPersonaInformation(false)
            .then(setPersonas)
            .then(() => set(false))
    }, [])
    const [useServerSnapshot, set] = useState(true)
    useEffect(() => {
        if (!initialPersonaInformation.value.length) {
            revalidate()
        }
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

    const currentPersona = personas.find(
        (x) => x.identifier === ECKeyIdentifier.from(currentIdentifier).unwrapOr(head(personas)?.identifier),
    )
    const avatar = currentPersona?.avatar

    const { data: proofs, isLoading: fetchProofsLoading } = usePersonaProofs(
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
                const network = NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP[x.platform]
                return {
                    ...x,
                    identifier: ProfileIdentifier.of(network, x.identity).expect(
                        `${network} and ${x.identity} should compose a valid ProfileIdentifier`,
                    ),
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
