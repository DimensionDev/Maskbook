import { PopupRoutes } from '@masknet/shared-base'
import { useMatch } from 'react-router-dom'
import { useMessages } from '@masknet/web3-hooks-base'

/**
 * Guardian for pending tasks
 */
export function useMessageGuard() {
    const matchInteraction = useMatch(PopupRoutes.ContractInteraction)
    const messages = useMessages()
    const nonSilentMessages = messages.filter((x) => !x.request.options.silent)

    return !matchInteraction && nonSilentMessages.length > 0
}
