import { useAsyncRetry } from 'react-use'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import Services from '../../extension/service.js'

export function useSelectedRecipientsList() {
    const iv = usePostInfoDetails.postIVIdentifier()!
    return useAsyncRetry(() => Services.Crypto.getIncompleteRecipientsOfPost(iv), [iv])
}
