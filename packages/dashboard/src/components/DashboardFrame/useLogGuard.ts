import { DashboardRoutes } from '@masknet/shared-base'
import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Services } from '../../API.js'

export function useLogGuard() {
    const navigate = useNavigate()

    useLayoutEffect(() => {
        Services.Settings.getLogSettings().then((loggerId) => {
            if (!loggerId) {
                navigate(DashboardRoutes.Welcome, {
                    replace: true,
                })
            }
        })
    }, [])
}
