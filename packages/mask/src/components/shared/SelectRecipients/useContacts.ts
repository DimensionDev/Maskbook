import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST, type ProfileInformation } from '@masknet/shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { useCurrentPersona } from '../../DataSource/useCurrentPersona.js'
import Services from '../../../extension/service.js'
import { isProfileIdentifier } from '@masknet/shared'

export function useContacts(network: string): AsyncStateRetry<ProfileInformation[]> {
    const currentPersona = useCurrentPersona()

    return useAsyncRetry(async () => {
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
        return Services.Identity.queryProfilesInformation(identifiers)
    }, [network, currentPersona])
}
