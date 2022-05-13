import { useCallback, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import type { ProfileInformation } from '@masknet/shared-base'
import Services from '../../extension/service'
import { useCurrentIdentity } from '../DataSource/useActivatedUI'
import type { LazyRecipients } from './CompositionUI'

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
