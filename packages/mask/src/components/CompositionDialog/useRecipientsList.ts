import { useCallback, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import Services from '../../extension/service.js'
import { useCurrentIdentity } from '../DataSource/useActivatedUI.js'
import type { LazyRecipients } from './CompositionUI.js'
import type { ProfileInformation } from '@masknet/web3-shared-base'

export function useRecipientsList(): LazyRecipients {
    const current = useCurrentIdentity()?.identifier
    const { value: hasRecipients = false } = useAsync(
        async () => (current ? Services.Crypto.hasRecipientAvailable(current) : undefined),
        [current],
    )
    const [recipients, setRecipients] = useState<ProfileInformation[] | undefined>(undefined)
    const request = useCallback(() => {
        if (!current) return
        if (recipients) return
        Services.Crypto.getRecipients(current).then(setRecipients)
    }, [current, !!recipients])

    return useMemo(
        () => ({
            request,
            recipients,
            hasRecipients,
        }),
        [request, recipients, hasRecipients],
    )
}
