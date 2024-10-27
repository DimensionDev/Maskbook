import { useAsyncRetry } from 'react-use'
import { usePostInfoPostIVIdentifier } from '@masknet/plugin-infra/content-script'
import Services from '#services'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useSelectedRecipientsList() {
    const iv = usePostInfoPostIVIdentifier()
    return useAsyncRetry(async () => (iv ? Services.Crypto.getIncompleteRecipientsOfPost(iv) : EMPTY_LIST), [iv])
}
