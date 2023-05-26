import { useAsyncRetry } from 'react-use'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import Services from '../../extension/service.js'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useSelectedRecipientsList() {
    const iv = usePostInfoDetails.postIVIdentifier()
    return useAsyncRetry(async () => (iv ? Services.Crypto.getIncompleteRecipientsOfPost(iv) : EMPTY_LIST), [iv])
}
