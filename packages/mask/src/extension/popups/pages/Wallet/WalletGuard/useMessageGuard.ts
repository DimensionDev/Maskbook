import { PopupRoutes } from '@masknet/shared-base'
import { useMatch, useNavigate } from 'react-router-dom'
import { useMessages } from '@masknet/web3-hooks-base'
import { useEffect } from 'react'

/**
 * Guardian for pending tasks
 */
export function useMessageGuard() {
    const navigate = useNavigate()
    const matchInteraction = !!useMatch(PopupRoutes.ContractInteraction)

    const messages = useMessages()

    useEffect(() => {
        if (matchInteraction || messages.length === 0) return
        navigate(PopupRoutes.ContractInteraction)
    }, [matchInteraction, messages.length === 0])
}
