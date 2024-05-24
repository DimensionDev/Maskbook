import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST, type ProfileInformation } from '@masknet/shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { useCurrentPersona } from '../../../../shared-ui/hooks/index.js'
import Services from '#services'
import { isProfileIdentifier } from '@masknet/shared'

export function useContacts(network: string | undefined): AsyncStateRetry<ProfileInformation[]> {
    const currentPersona = useCurrentPersona()

    return useAsyncRetry(async () => {
        if (!network) return EMPTY_LIST
        const values = await Services.Identity.queryRelationPaged(
            currentPersona?.identifier,
            {
                network,
                pageOffset: 0,
            },
            1000,
        )
        if (values.length === 0) return EMPTY_LIST

        const identifiers = values.map((x) => x.profile).filter(isProfileIdentifier)
        return (await Services.Identity.queryProfilesInformation(identifiers)).filter(
            (x) => x.linkedPersona && x.linkedPersona !== currentPersona?.identifier,
        )
    }, [network, currentPersona])
}
