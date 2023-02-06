import { DashboardRoutes } from '@masknet/shared-base'
import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { Services } from '../../API.js'

export function useLogGuard() {
    const navigate = useNavigate()
    const result = useAsync(async () => {
        return Services.Settings.getLogSettings()
    }, [])

    useLayoutEffect(() => {
        if (!result.value) {
            navigate(DashboardRoutes.Welcome, {
                replace: true,
            })
        }
    }, [!result.value])
    return result
}
