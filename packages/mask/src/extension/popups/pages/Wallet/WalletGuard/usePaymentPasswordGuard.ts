import { PopupRoutes } from '@masknet/shared-base'
import { useMatch } from 'react-router-dom'
import { useHasPassword } from '../../../hooks/index.js'

export function usePaymentPasswordGuard() {
    const { hasPassword, loading } = useHasPassword()
    const matchSetPaymentPassword = useMatch(PopupRoutes.SetPaymentPassword)

    return !matchSetPaymentPassword && !hasPassword && !loading
}
