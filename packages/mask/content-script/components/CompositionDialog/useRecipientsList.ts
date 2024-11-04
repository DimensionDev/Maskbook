import { useCallback, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import type { ProfileInformation } from '@masknet/shared-base'
import Services from '#services'
import { useCurrentIdentity } from '../DataSource/useActivatedUI.js'
import type { LazyRecipients } from './CompositionUI.js'

export function useRecipientsList(): LazyRecipients {
    const current = useCurrentIdentity()?.identifier
    const { value: hasRecipients = false } = useAsync(
        async () => (current ? Services.Crypto.hasRecipientAvailable(current) : undefined),
        [current],
    )
    const [recipients, setRecipients] = useState<ProfileInformation[] | undefined>(undefined)
    const hasRecipientsInState = !!recipients
    const request = useCallback(() => {
        if (!current) return
        if (hasRecipientsInState) return
        Services.Crypto.getRecipients(current).then(setRecipients)
    }, [current, hasRecipientsInState])

    return useMemo(
        () => ({
            request,
            recipients,
            hasRecipients,
        }),
        [request, recipients, hasRecipients],
    )
}
