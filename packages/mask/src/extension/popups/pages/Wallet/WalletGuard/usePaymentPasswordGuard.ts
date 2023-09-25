import { PopupRoutes } from '@masknet/shared-base'
import { useEffect } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { useHasPassword } from '../../../hooks/index.js'

export function usePaymentPasswordGuard() {
    const { hasPassword, loading } = useHasPassword()
    const matchSetPaymentPassword = !!useMatch(PopupRoutes.SetPaymentPassword)
    const navigate = useNavigate()

    useEffect(() => {
        if (matchSetPaymentPassword || hasPassword || loading) return
        navigate(PopupRoutes.SetPaymentPassword)
    }, [matchSetPaymentPassword, !hasPassword, loading])
}
