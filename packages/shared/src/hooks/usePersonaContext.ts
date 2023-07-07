import { useCallback, useEffect, useMemo, useState } from 'react'
import { head, unionWith, uniqBy } from 'lodash-es'
import { createContainer } from 'unstated-next'
import {
    ECKeyIdentifier,
    EMPTY_LIST,
    isSameProfile,
    type PersonaInformation,
    ProfileIdentifier,
    NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP,
    MaskMessages,
    currentPersonaIdentifier,
    ValueRef,
    NextIDPlatform,
    type ProfileAccount,
} from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { usePersonaProofs } from './usePersonaProofs.js'
import compareDesc from 'date-fns/compareDesc'

export const initialPersonaInformation = new ValueRef<PersonaInformation[]>([])

function useSSRPersonaInformation(
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>,
) {
    const [personas, setPersonas] = useState(useValueRef(initialPersonaInformation))
    const revalidate = useCallback(() => {
        queryOwnedPersonaInformation?.(false)
            ?.then(setPersonas)
            .then(() => set(false))
    }, [queryOwnedPersonaInformation])
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

function usePersonaContext(initialState?: {
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>
}) {
    const [selectedAccount, setSelectedAccount] = useState<ProfileAccount>()
    const [selectedPersona, setSelectedPersona] = useState<PersonaInformation>()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    const { personas } = useSSRPersonaInformation(initialState?.queryOwnedPersonaInformation)

    const currentPersona = personas?.find(
        (x) => x.identifier === ECKeyIdentifier.from(currentIdentifier).unwrapOr(head(personas)?.identifier),
    )
    const avatar = currentPersona?.avatar

    const { data: proofs, isLoading: fetchProofsLoading } = usePersonaProofs(currentPersona?.identifier.publicKeyAsHex)

    const accounts = useMemo(() => {
        if (!currentPersona) return EMPTY_LIST

        const localProfiles = currentPersona.linkedProfiles.map<ProfileAccount>((profile) => ({
            ...profile,
            identity: profile.identifier.userId,
        }))

        if (!proofs) return localProfiles

        const remoteProfiles = proofs
            .filter((x) => !!NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP[x.platform])
            .map<ProfileAccount>((x) => {
                const network = NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP[x.platform]
                return {
                    ...x,
                    identifier: ProfileIdentifier.of(network, x.identity).expect(
                        `${network} and ${x.identity} should compose a valid ProfileIdentifier`,
                    ),
                }
            })

        return unionWith(remoteProfiles, localProfiles, isSameProfile)
            .map((x) => {
                const localProfile = localProfiles.find((profile) => isSameProfile(profile, x))
                if (!localProfile) return x

                return {
                    ...x,
                    ...localProfile,
                }
            })
            .sort((a, b) => {
                const aTimeZone = a.createAt?.getTime()
                const bTimeZone = b.createAt?.getTime()

                if (a.is_valid) return -1
                if (b.is_valid) return 1

                if (a.last_checked_at && b.last_checked_at) {
                    return Number(a.last_checked_at) < Number(b.last_checked_at) ? -1 : 1
                }

                if (a.createAt && b.createAt && !!aTimeZone && !!bTimeZone) {
                    return compareDesc(a.createAt, b.createAt)
                }

                if (a.identity && b.identity && a.identity !== b.identity) return a.identity < b.identity ? -1 : 1

                return 0
            })
    }, [proofs, currentPersona])

    const walletProofs = useMemo(() => {
        if (!proofs?.length) return EMPTY_LIST
        return uniqBy(
            proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum),
            (x) => x.identity,
        )
    }, [proofs])

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
        walletProofs,
    }
}

export const PersonaContext = createContainer(usePersonaContext)
